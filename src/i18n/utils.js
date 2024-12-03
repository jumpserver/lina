import VueCookie from 'vue-cookie'
import store from '@/store'

export function getLangCode(withInternalCode = false) {
  const cookieLang = VueCookie.get('django_language')
  let lang = cookieLang || navigator.language.toLowerCase()
  if (withInternalCode) {
    const languages = store.getters.publicSettings['LANGUAGES']
    for (const langObj of languages) {
      if (langObj['other_codes'].indexOf(lang) > -1) {
        lang = langObj['code']
        break
      }
    }
  }
  return lang
}

