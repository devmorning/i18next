import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next"
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import {useEffect} from "react";
// import ko from './../../src/i18n/locales/ko/translation.json'
// import en from './../../src/i18n/locales/en/translation.json'
// import jp from './../../src/i18n/locales/jp/translation.json'
import ko from './../../src/i18n/locales/ko/common.json'
import en from './../../src/i18n/locales/en/common.json'
import jp from './../../src/i18n/locales/jp/common.json'
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import resourcesToBackend from "i18next-resources-to-backend";
import i18next from "i18next";

const fallbackLng = ["en"];
const availableLanguages = ["en", "jp", "ko"];

const resources = {
  ko: { common: ko, translation: ko },
  en: { common: en, translation: en },
  jp: { common: jp, translation: jp },
}

// const browserLang = window.navigator.language.split('-')[0];
console.log(resources)

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng:'en',
    debug: true,
    ns: 'common',
    defaultNS: 'common'
  })

console.log(i18n.t('key1'))

const I18n = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
  })
  // useEffect(() => {
  //   i18next
  //     .use(HttpApi) // load translations using http (default public/locals/en/translations)
  //     .use(LanguageDetector) // detect user language
  //     .use(initReactI18next) // passes i18n down to react-i18next
  //     .init({
  //       resources,
  //       lng: 'ko',
  //       fallbackLng: 'ko',
  //       debug: false,
  //       defaultNS: 'common',
  //       ns: 'common',
  //       keySeparator: false,
  //       interpolation: {
  //         escapeValue: false,
  //         alwaysFormat: true,
  //         format(value, format, lng) {
  //           if (format === 'uppercase') return value.toUpperCase();
  //           // interpolation 되는 값이 number로 들어올 때, 언어 설정에 맞는 locale string으로 변환해서 반환
  //           if (typeof value === 'number') return value.toLocaleString(lng);
  //           return value;
  //         },
  //       }});
  // }, [])
  useEffect(() => {
    // i18n2
    //   .use(initReactI18next)
    //   .init({
    //     resources,
    //     lng: 'ko',
    //     fallbackLng: "en",
    //     ns: ['common'],
    //     defaultNS: 'common',
    //   });
  }, []);

  const onC = (e) => {
    console.log('!!!!C', e)
    i18n.changeLanguage(e.target.textContent)
  }

  // i18n2.on('languageChanged', () => {
  //   console.log('change Lang')
  // });




  return (
    <>
      <p>::: {i18next.t('testKey1')}</p>
      <p>::: {i18next.t('testKey2')}</p>
      <p>jfajsdlkfasdf:{t('key3')}</p>
      <button onClick={onC}>en</button>
      <button onClick={onC}>ko</button>
      <button onClick={onC}>jp</button>
    </>
  );
}

export default I18n;