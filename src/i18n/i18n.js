// i18n.js
import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import messages from './langs'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: localStorage.lang || 'cn',
  messages
})
locale.i18n((key, value) => i18n.t(key, value)) // 重点: 为了实现element插件的多语言切换
Vue.prototype.$ti = (key) => {
  return i18n.t(key.toLowerCase())
}

Vue.prototype.$tr = (key) => {
  return i18n.t('route.' + key)
}

Vue.prototype.$tc = (key) => {
  return i18n.t('common.' + key)
}

Vue.prototype.$tic = (key) => {
  key = 'common.' + key
  return i18n.t(key.toLowerCase())
}

Vue.prototype.$ti = (key) => {
  i18n.t(key.toLowerCase)
}

export default i18n
