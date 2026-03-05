import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            es: {
                translation: esTranslations
            }
        },
        // Attempt to load from localStorage, fallback to English
        lng: localStorage.getItem('appLang') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('appLang', lng);
});

export default i18n;
