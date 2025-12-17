// i18n.js
import { createI18n } from 'vue-i18n'
import messages from './langs'
import date from './date'
import axios from 'axios'
import { getLangCode } from './utils'
import store from '@/store'

const lang = getLangCode()

const i18n = createI18n({
  legacy: true, // keep Options API style helpers ($t/$tc)
  globalInjection: true,
  locale: lang,
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  datetimeFormats: date,
  messages
})

// Provide Vue2-style helpers for legacy imports
i18n.t = i18n.global.t.bind(i18n.global)
i18n.tc = i18n.global.tc.bind(i18n.global)

// 自定义 tc 方法, 默认添加 s
const originalTc = i18n.global.tc.bind(i18n.global)

i18n.global.tc = function(key, choice, ...args) {
  // 获取原始翻译结果
  const translation = i18n.global.t(key, choice).toString()

  // 仅处理英语且翻译不包含复数形式的情况
  if (i18n.global.locale === 'en') {
    const parts = translation.split('|')
    if (parts.length === 1) {
      // 自动添加 's'（当数量不等于1时）
      return choice > 1 ? `${translation}s` : translation
    }
  }
  return originalTc(key, choice, ...args)
}

export async function fetchTranslationsFromAPI() {
  try {
    const res = await axios.get(`/api/v1/settings/i18n/lina/?lang=${lang}&flat=0`)
    const data = res.data
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        i18n.global.mergeLocaleMessage(key, data[key])
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    await store.dispatch('app/setI18nLoaded', true)
  }
}

i18n.tc = i18n.global.tc.bind(i18n.global)

export default i18n
