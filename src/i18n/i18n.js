// i18n.js
import Vue from 'vue'
import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import messages from './langs'
import date from './date'
import axios from 'axios'
import store from '@/store'
import { getLangCode } from './utils'

Vue.use(VueI18n)
const lang = getLangCode()

const i18n = new VueI18n({
  locale: lang,
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  dateTimeFormats: date,
  messages
})
locale.i18n((key, value) => i18n.t(key, value)) // 重点: 为了实现element插件的多语言切换

// 自定义 tc 方法, 默认添加 s
const originalTc = i18n.tc.bind(i18n)

i18n.tc = function(key, choice, ...args) {
  // 获取原始翻译结果
  const translation = originalTc(key, choice, ...args)

  // 仅处理英语且翻译不包含复数形式的情况
  if (this.locale === 'en') {
    const parts = translation.split('|')
    if (parts.length === 1) {
      // 自动添加 's'（当数量不等于1时）
      return choice > 1 ? `${translation}s` : translation
    }
  }
  return translation
}

Vue.prototype.$tc = i18n.tc.bind(i18n)
Vue.prototype.$tr = (key) => {
  return i18n.t('' + key)
}

axios.get(`/api/v1/settings/i18n/lina/?lang=${lang}&flat=0`)
  .then((res) => {
    if (res.status !== 200) {
      return
    }
    const data = res.data
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        i18n.mergeLocaleMessage(key, data[key])
      }
    }
  })
  .finally(() => {
    store.dispatch('app/setI18nLoaded', true)
  })

export default i18n
