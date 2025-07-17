import zhLocale from 'elementui-lts/lib/locale/lang/zh-CN'
import zhTWLocale from 'elementui-lts/lib/locale/lang/zh-TW'
import enLocale from 'elementui-lts/lib/locale/lang/en'
import jaLocale from 'elementui-lts/lib/locale/lang/ja'
import ptBrLocale from 'elementui-lts/lib/locale/lang/pt-br'
import esLocale from 'elementui-lts/lib/locale/lang/es'
import ruLocale from 'elementui-lts/lib/locale/lang/ru-RU'
import koLocale from 'elementui-lts/lib/locale/lang/ko'
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
