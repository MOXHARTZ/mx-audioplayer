import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { ReadyListener } from '@/types';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {},
    initImmediate: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});

export const loadLocale = (data: ReadyListener) => {
    for (const [lang, bundle] of Object.entries(data.resources ?? {})) {
        i18n.addResourceBundle(lang, 'translation', bundle.translation, true, true);
    }
    if (data.languageName) {
        i18n.changeLanguage(data.languageName);
    }
};

export default i18n;
