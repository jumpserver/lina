import en from './en.json'
import ja from './ja.json'
import zh from './zh.json'
import zh_hant from './zh_hant.json'
import elementEn from 'element-plus/es/locale/lang/en'
import elementEs from 'element-plus/es/locale/lang/es'
import elementJa from 'element-plus/es/locale/lang/ja'
import elementKo from 'element-plus/es/locale/lang/ko'
import elementPtBr from 'element-plus/es/locale/lang/pt-br'
import elementRu from 'element-plus/es/locale/lang/ru'
import elementVi from 'element-plus/es/locale/lang/vi'
import elementZhCn from 'element-plus/es/locale/lang/zh-cn'
import elementZhTw from 'element-plus/es/locale/lang/zh-tw'

const elementLocaleByAppLocale = {
  zh: elementZhCn,
  zh_hant: elementZhTw,
  en: elementEn,
  ja: elementJa,
  pt_br: elementPtBr,
  es: elementEs,
  ru: elementRu,
  ko: elementKo,
  vi: elementVi
}

const appLocaleMessages = {
  zh,
  zh_hant,
  en,
  ja
}

const messages = Object.keys(elementLocaleByAppLocale).reduce((acc, appLocale) => {
  const elementLocale = elementLocaleByAppLocale[appLocale] || {}
  const appMessages = appLocaleMessages[appLocale] || {}
  acc[appLocale] = { ...elementLocale, ...appMessages }
  return acc
}, {})

export default messages
