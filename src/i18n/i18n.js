// i18n.js
import store from '@/store'
import axios from 'axios'
import { createI18n } from 'vue-i18n'
import date from './date'
import messages from './langs'
import { getLangCode } from './utils'

const lang = getLangCode()

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  globalInjection: true, // Keep $t/$tc available globally
  locale: lang,
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  datetimeFormats: date,
  messages
})

function getCurrentLocale() {
  const locale = i18n.global.locale
  return typeof locale === 'string' ? locale : locale?.value
}

function compatTc(key, choice, ...args) {
  const hasNumericChoice = typeof choice === 'number'
  const locale = getCurrentLocale()

  if (!hasNumericChoice) {
    if (typeof choice === 'undefined' && args.length === 0) {
      return i18n.global.t(key)
    }
    return i18n.global.t(key, choice, ...args)
  }

  const translation = i18n.global.t(key, choice, ...args).toString()

  if (locale === 'en') {
    const parts = translation.split('|')
    if (parts.length === 1) {
      return choice > 1 ? `${translation}s` : translation
    }
  }

  return translation
}

// Provide Vue2-style helpers for legacy imports
i18n.t = i18n.global.t.bind(i18n.global)
i18n.global.tc = compatTc
i18n.tc = compatTc.bind(i18n.global)

export async function fetchTranslationsFromAPI() {
  try {
    const res = await axios.get(`/api/v1/settings/i18n/lina/?lang=${lang}&flat=0`)
    const data = res.data
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        i18n.global.mergeLocaleMessage(key, data[key])
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    await store.dispatch('app/setI18nLoaded', true)
  }
}

export default i18n
