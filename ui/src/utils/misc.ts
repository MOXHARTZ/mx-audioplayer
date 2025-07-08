import { addToast } from "@heroui/react";
import { useEffect, useState } from "react";
import { fetchNui } from "./fetchNui";

export const isEnvBrowser = (): boolean => !(window as any).invokeNative;
export const noop = () => { }
export const formatNumber = (amount: string | number) => new Intl.NumberFormat().format(+amount);
export const defaultNumber = (value: string | number) => String(value).split(",").join("");
export const isEmpty = (value: any) => {
    if (!value) return true;
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

const validQueryDomains = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
]);

export const getYoutubePlaylistID = (url: string) => {
    try {
        const parsed = new URL(url);
        if (!validQueryDomains.has(parsed.hostname)) return null;
        const id = parsed.searchParams.get('list');
        if (!id) return null;
        return id
    } catch (e) {
        return null;
    }
}

// yoinked from https://github.com/project-error/npwd/blob/d8dc5b7f47faf5fc581ffee30f31ff61d184cfe7/phone/src/os/phone/hooks/useClipboard.ts#L1
export const setClipboard = (value: string) => {
    const clipElem = document.createElement('input');
    clipElem.value = value;
    document.body.appendChild(clipElem);
    clipElem.select();
    document.execCommand('copy');
    document.body.removeChild(clipElem);
};

export const formattedTypes = {
    info: 'primary',
    error: 'danger',
    success: 'success',
} as const;

export function notification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (isEnvBrowser()) {
        addToast({
            title: type.toUpperCase(),
            description: message,
            color: formattedTypes[type],
            shouldShowTimeoutProgress: true,
            timeout: 3000,
            variant: 'flat',
        })
        return
    }
    fetchNui('notification', { message, type });
}

export const isSpotifyPlaylist = (url: string) => {
    const regex = /^(https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]+)(.*)$/;
    return regex.test(url)
}

export const isSpotifyAlbum = (url: string) => {
    const regex = /^(https:\/\/open\.spotify\.com\/album\/)([a-zA-Z0-9]+)(.*)$/;
    return regex.test(url)
}

export const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';