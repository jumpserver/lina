import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import zhTWLocale from 'element-ui/lib/locale/lang/zh-TW'
import enLocale from 'element-ui/lib/locale/lang/en'
import jaLocale from 'element-ui/lib/locale/lang/ja'
import ptBrLocale from 'element-ui/lib/locale/lang/pt-br'
import esLocale from 'element-ui/lib/locale/lang/es'
import ruLocale from 'element-ui/lib/locale/lang/ru-RU'
import koLocale from 'element-ui/lib/locale/lang/ko'
import zh from './zh.json'
import zhHant from './zh_hant.json'
import en from './en.json'
import ja from './ja.json'

const messages = {
  zh: {
    ...zhLocale,
    ...zh
  },
  zh_hant: {
    ...zhTWLocale,
    ...zhHant
  },
  en: {
    ...enLocale,
    ...en
  },
  ja: {
    ...jaLocale,
    ...ja
  },
  pt_br: {
    ...ptBrLocale
  },
  es: {
    ...esLocale
  },
  ru: {
    ...ruLocale
  },
  ko: {
    ...koLocale
  }
}

export default messages
