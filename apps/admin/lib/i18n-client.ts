"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "../public/locales/en/translation.json";
import translationAR from "../public/locales/ar/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
      react: {
        useSuspense: false, // prevent SSR/hydration issues
      },
    });
}

export default i18next;
export { useTranslation } from "react-i18next";
