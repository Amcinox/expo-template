import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, fr, ja, es, ar } from "./translations";
import { getLocales } from "expo-localization";


const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  ja: {
    translation: ja,
  },
  es: {
    translation: es,
  },
  ar: {
    translation: ar,
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: getLocales()[0]?.languageCode || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});




export default i18n;
