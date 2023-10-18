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
export const generateSoundId = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
}