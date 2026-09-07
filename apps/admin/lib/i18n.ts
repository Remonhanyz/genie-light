import i18next from "i18next";
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
  i18next.init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
}

export default i18next;
