import { useEffect, useState } from "react";

export const isEnvBrowser = (): boolean => !(window as any).invokeNative;
export const IN_DEVELOPMENT = process.env.NODE_ENV === "development";
export const noop = () => { }
export const formatNumber = (amount: string | number) => new Intl.NumberFormat().format(+amount);
export const defaultNumber = (value: string | number) => String(value).split(",").join("");
export const isEmpty = (value: any) => {
    if (value === undefined || value === null) return true;
    if (value == '') return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}
export const NOTIFICATION = {
    toastStyle: { backgroundColor: 'rgba(0,0,0,0.7)' },
    progressStyle: { backgroundColor: 'rgba(255,255,255,0.1)' },
    theme: 'dark',
    autoClose: 3500,
    draggable: false,
    pauseOnHover: false,
    pauseOnFocusLoss: false
} as {
    toastStyle: React.CSSProperties;
    progressStyle: React.CSSProperties;
    theme: 'dark' | 'light';
    autoClose: number;
    draggable: boolean;
    pauseOnHover: boolean;
    pauseOnFocusLoss: boolean
}

export const formatDuration = (value: number) => {
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    const formattedSecond = secondLeft < 10 ? `0${secondLeft}` : secondLeft;
    return `${minute}:${formattedSecond}`;
}

// https://usehooks-ts.com/react-hook/use-debounce
export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

export const isUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export const isYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

export const isSoundCloudUrl = (url: string) => {
    const soundcloudRegex = /^(https?\:\/\/)?(www\.)?(soundcloud\.com)\/.+$/;
    return soundcloudRegex.test(url);
}

export const isSpotifyUrl = (url: string) => {
    const spotifyRegex = /^(https?\:\/\/)?(www\.)?(open\.spotify\.com)\/.+$/;
    return spotifyRegex.test(url);
}