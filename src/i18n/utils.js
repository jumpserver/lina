import VueCookie from 'vue-cookie'

export function getLangCode() {
  const cookieLang = VueCookie.get('django_language')
  const browserLang = navigator.systemLanguage || navigator.language || navigator.userLanguage
  let lang = cookieLang || browserLang || 'en'
  lang = lang.replace('-', '_')
  if (lang !== 'zh_hant') {
    lang = lang.slice(0, 2)
  }
  return lang
}

