import { Track } from "@/fake-api/search-results";

export type QueryResult = Error | Track[]
export interface Error {
    error: string;
    code: number;
}

export type ReadyListener = {
    languageName: string;
    resources: Record<string, Record<string, string>>;
    settings: Settings;
}

export type Player = {
    source: number;
    name: string;
}

export type MinimalHudPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type Settings = {
    minimalHud: boolean;
    minimalHudPosition?: MinimalHudPosition;
}