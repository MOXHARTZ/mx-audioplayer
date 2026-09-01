import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { NuiApiError, fetchNui, formatIssues, isEnvBrowser } from './nui';

const setGameEnv = (inGame: boolean) => {
    if (inGame) {
        (window as any).invokeNative = () => { };
    } else {
        delete (window as any).invokeNative;
    }
};

describe('isEnvBrowser', () => {
    afterEach(() => setGameEnv(false));

    it('is true without invokeNative and false with it', () => {
        setGameEnv(false);
        expect(isEnvBrowser()).toBe(true);
        setGameEnv(true);
        expect(isEnvBrowser()).toBe(false);
    });
});

describe('formatIssues', () => {
    it('renders one readable line per issue', () => {
        const parsed = z.object({ total: z.number() }).safeParse({ total: 'nope' });
        expect(parsed.success).toBe(false);
        expect(formatIssues(parsed.error!)).toContain('total:');
    });

    it('labels a root level issue', () => {
        const parsed = z.number().safeParse('nope');
        expect(formatIssues(parsed.error!)).toContain('(root)');
    });
});

describe('fetchNui', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => setGameEnv(false));

    it('returns the mock value in browser mode without hitting the network', async () => {
        setGameEnv(false);
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        await expect(fetchNui('play', undefined, { mock: true })).resolves.toBe(true);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('still accepts the bare mock argument used by older call sites', async () => {
        setGameEnv(false);
        await expect(fetchNui('getCurrentSongDuration', undefined, 42)).resolves.toBe(42);
    });

    it('posts to the resource endpoint in game', async () => {
        setGameEnv(true);
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        } as Response);

        await expect(fetchNui('togglePlay', true)).resolves.toEqual({ ok: true });
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/togglePlay'),
            expect.objectContaining({ method: 'post' }),
        );
    });

    it('throws NUI_REQUEST_FAILED on a non-ok response', async () => {
        setGameEnv(true);
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

        await expect(fetchNui('play')).rejects.toMatchObject({
            name: NuiApiError.name,
            code: 'NUI_REQUEST_FAILED',
        });
    });

    it('throws NUI_INVALID_RESPONSE when the schema rejects the payload', async () => {
        setGameEnv(true);
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ duration: 'not a number' }),
        } as Response);

        await expect(
            fetchNui('getCurrentSongDuration', undefined, { schema: z.object({ duration: z.number() }) }),
        ).rejects.toMatchObject({
            name: 'NuiApiError',
            code: 'NUI_INVALID_RESPONSE',
        });
    });

    it('carries the ZodError so the console shows the offending field', async () => {
        setGameEnv(true);
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ duration: 'nope' }),
        } as Response);

        await fetchNui('x', undefined, { schema: z.object({ duration: z.number() }) }).catch((error) => {
            expect(error).toBeInstanceOf(NuiApiError);
            expect(formatIssues((error as NuiApiError).details as z.ZodError)).toContain('duration');
        });
    });
});
