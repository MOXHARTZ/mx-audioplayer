import { Track } from "@/fake-api/search-results";

export type QueryResult = Error | Track[]
export interface Error {
    error: string;
    code: number;
}