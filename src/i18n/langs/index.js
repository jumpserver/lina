import zh from './zh.json'
import zh_hant from './zh_hant.json'
import en from './en.json'
import ja from './ja.json'

// Map app locales to Element-UI locale file names
const elementLocaleNameByAppLocale = {
  zh: 'zh-CN',
  zh_hant: 'zh-TW',
  en: 'en',
  ja: 'ja',
  pt_br: 'pt-br',
  es: 'es',
  ru: 'ru-RU',
  ko: 'ko',
  vi: 'vi'
}

function loadElementLocale(localeName) {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const mod = require(`element-plus/es/locale/lang/${localeName}`)
    return (mod && (mod.default || mod)) || {}
  } catch (e) {
    return {}
  }
}

const appLocaleMessages = {
  zh,
  zh_hant,
  en,
  ja
}

const messages = Object.keys(elementLocaleNameByAppLocale).reduce((acc, appLocale) => {
  const elementLocaleName = elementLocaleNameByAppLocale[appLocale]
  const elementLocale = loadElementLocale(elementLocaleName)
  const appMessages = appLocaleMessages[appLocale] || {}
  acc[appLocale] = { ...elementLocale, ...appMessages }
  return acc
}, {})

export default messages
