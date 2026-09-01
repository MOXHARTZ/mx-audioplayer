import '@testing-library/jest-dom/vitest';

if (!('crypto' in globalThis) || !globalThis.crypto.getRandomValues) {
    Object.defineProperty(globalThis, 'crypto', {
        value: { getRandomValues: (array: Uint8Array) => array.map(() => Math.floor(Math.random() * 256)) },
    });
}
