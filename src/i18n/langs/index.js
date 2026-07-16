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

// 后端下发的 cookie(django_language)语言码 → Element Plus 内置 locale 对象。
// 供 main.js 在安装 ElementPlus 插件时按当前语言设置内置组件(messagebox/分页/
// 空状态/日期选择器等)的文案;语言切换会整页 reload,故静态取当前语言即可。
const elementLocaleByCookieLang = {
  'zh-hans': elementZhCn,
  'zh-cn': elementZhCn,
  zh: elementZhCn,
  'zh-hant': elementZhTw,
  'zh-tw': elementZhTw,
  en: elementEn,
  ja: elementJa,
  'pt-br': elementPtBr,
  es: elementEs,
  ru: elementRu,
  ko: elementKo,
  vi: elementVi
}

export function getElementLocale(cookieLang) {
  const raw = (cookieLang || 'en').toLowerCase()
  return elementLocaleByCookieLang[raw] || elementLocaleByCookieLang[raw.split('-')[0]] || elementEn
}

export default messages
