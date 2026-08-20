import { VueCookieNext as VueCookie } from 'vue-cookie-next'
import { getStore } from '@/store/registry'

export function getLangCode(withInternalCode = false) {
  const cookieLang = VueCookie.getCookie('django_language')
  let lang = cookieLang || navigator.language.toLowerCase()
  if (withInternalCode) {
    const store = getStore()
    const languages = store?.getters?.publicSettings?.['LANGUAGES'] || []
    for (const langObj of languages) {
      if (langObj['other_codes'].indexOf(lang) > -1) {
        lang = langObj['code']
        break
      }
    }
  }
  return lang
}
