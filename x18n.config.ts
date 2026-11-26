import { defineConfig } from '@x18n/core'

export default defineConfig({
  sourceLocale: 'en',
  resources: [
    {
      pattern: 'src/i18n/langs/{locale}.json'
    }
  ],
  presets: ['vue-i18n']
})
