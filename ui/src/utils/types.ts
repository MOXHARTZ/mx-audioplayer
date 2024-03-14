import { Track } from "@/fake-api/search-results";

export type QueryResult = Error | Track[]
export interface Error {
    error: string;
    code: number;
}

export type ReadyListener = {
    languageName: string;
    resources: Record<string, Record<string, string>>;
}

export type Player = {
    source: number;
    name: string;
}