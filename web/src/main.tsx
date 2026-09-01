import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import App from './App';
import './index.css';
import './App.css';

const originalError = window.onerror;
window.onerror = (message, ...rest) => {
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) return true;
    return originalError ? (originalError as any)(message, ...rest) : false;
};

window.confirm = (message?: string) => {
    console.error('[mx-audioplayer] window.confirm is unusable in NUI; use a modal.', message);
    return false;
};
window.alert = (message?: unknown) => {
    console.error('[mx-audioplayer] window.alert is unusable in NUI.', message);
};
window.prompt = (message?: string) => {
    console.error('[mx-audioplayer] window.prompt is unusable in NUI.', message);
    return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HeroUIProvider className="w-full h-full">
            <ToastProvider placement="top-center" toastOffset={20} />
            <App />
        </HeroUIProvider>
    </React.StrictMode>,
);
