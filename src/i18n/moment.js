import moment from 'moment'
// Use ESM locales so registration shares Vite's Moment instance.
import 'moment/dist/locale/es'
import 'moment/dist/locale/fr'
import 'moment/dist/locale/ja'
import 'moment/dist/locale/ko'
import 'moment/dist/locale/pt-br'
import 'moment/dist/locale/ru'
import 'moment/dist/locale/vi'
import 'moment/dist/locale/zh-cn'
import 'moment/dist/locale/zh-tw'

const localeAliases = {
  zh: 'zh-cn',
  'zh-hans': 'zh-cn',
  'zh-hant': 'zh-tw',
  'zh-hk': 'zh-tw'
}

export function getMomentLocale(locale) {
  const normalized = String(locale || 'en')
    .toLowerCase()
    .replace(/_/g, '-')
  const resolved = localeAliases[normalized] || normalized
  const supported = moment.locales()
  if (supported.includes(resolved)) return resolved
  const language = resolved.split('-')[0]
  return supported.includes(language) ? language : 'en'
}

export default moment
