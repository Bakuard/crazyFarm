'use strict'

const i18next = require('i18next');
const i18nMiddleware = require('i18next-http-middleware');

i18next.
    use(i18nMiddleware.LanguageDetector).
    init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'ru'],
        debug: true,
        resources: {
            en: { translation: require('../../resources/strings/en.json') },
            ru: { translation: require('../../resources/strings/ru.json') }
        }
    });

module.exports.i18next = i18next;
module.exports.i18nMiddleware = i18nMiddleware;