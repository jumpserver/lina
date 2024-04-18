// i18n.js
import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import messages from './langs'
import date from './date'
import VueCookie from 'vue-cookie'

Vue.use(VueI18n)
const cookieLang = VueCookie.get('django_language')
const browserLang = navigator.systemLanguage || navigator.language
let lang = cookieLang || browserLang || 'zh'
if (lang === 'zh-hant') {
  lang = 'zh_hant'
} else {
  lang = lang.slice(0, 2)
}

const i18n = new VueI18n({
  locale: lang,
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  dateTimeFormats: date,
  messages
})
locale.i18n((key, value) => i18n.t(key, value)) // 重点: 为了实现element插件的多语言切换

Vue.prototype.$tr = (key) => {
  return i18n.t('route.' + key)
}

export default i18n
