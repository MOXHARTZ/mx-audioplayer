import { useEffect, useRef } from 'react';
import { z } from 'zod';

export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'mx-audioplayer';

export class NuiApiError extends Error {
    readonly code: 'NUI_REQUEST_FAILED' | 'NUI_INVALID_RESPONSE';
    readonly details?: unknown;

    constructor(message: string, code: NuiApiError['code'], details?: unknown) {
        super(message);
        this.name = 'NuiApiError';
        this.code = code;
        this.details = details;
    }
}

export function formatIssues(error: z.ZodError): string {
    return error.issues
        .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join(', ');
}

function logNuiError(eventName: string, error: unknown) {
    if (error instanceof NuiApiError) {
        const detail = error.details instanceof z.ZodError
            ? formatIssues(error.details)
            : error.details;
        console.error(`[NUI:${eventName}] ${error.code} - ${error.message}`, detail ?? null);
        return;
    }
    console.error(`[NUI:${eventName}] UNEXPECTED_ERROR`, error);
}

function parseWithSchema<T>(schema: z.ZodType<T> | undefined, payload: unknown, eventName: string): T {
    if (!schema) return payload as T;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
        throw new NuiApiError(
            `NUI response validation failed for "${eventName}"`,
            'NUI_INVALID_RESPONSE',
            parsed.error,
        );
    }
    return parsed.data;
}

interface FetchNuiOptions<T> {
    schema?: z.ZodType<T>;
    mock?: T;
}

export async function fetchNui<T = unknown>(
    eventName: string,
    data?: unknown,
    optionsOrMock?: FetchNuiOptions<T> | T,
): Promise<T> {
    const options: FetchNuiOptions<T> = isFetchOptions(optionsOrMock)
        ? optionsOrMock
        : { mock: optionsOrMock as T };

    try {
        if (isEnvBrowser()) {
            return parseWithSchema(options.schema, options.mock, eventName);
        }

        const resp = await fetch(`https://${resourceName}/${eventName}`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data),
        });

        if (!resp.ok) {
            throw new NuiApiError(`Failed to fetch NUI callback "${eventName}"`, 'NUI_REQUEST_FAILED');
        }

        return parseWithSchema(options.schema, await resp.json(), eventName);
    } catch (error) {
        logNuiError(eventName, error);
        throw error;
    }
}

function isFetchOptions<T>(value: unknown): value is FetchNuiOptions<T> {
    return typeof value === 'object'
        && value !== null
        && ('schema' in value || 'mock' in value);
}

interface NuiMessageData<T = unknown> {
    action: string;
    data: T;
}

export const useNuiEvent = <T = any>(action: string, handler: (data: T) => void) => {
    const savedHandler = useRef<(data: T) => void>(() => { });

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const listener = (event: MessageEvent<NuiMessageData<T>>) => {
            if (event.data?.action === action) {
                savedHandler.current(event.data.data);
            }
        };
        window.addEventListener('message', listener);
        return () => window.removeEventListener('message', listener);
    }, [action]);
};

export const debugData = <P>(events: NuiMessageData<P>[], timer = 500): void => {
    if (!isEnvBrowser()) return;
    for (const event of events) {
        setTimeout(() => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { action: event.action, data: event.data },
            }));
        }, timer);
    }
};
