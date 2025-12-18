import { createApp, configureCompat } from 'vue'
import ElementPlus from 'element-plus'
import enLocale from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
// 导入 Element Plus CSS 变量配置（需要在 Element Plus 样式之后，自定义样式之前）
import '@/styles/element-plus-vars.css'
import '@/styles/index.scss' // global css
import App from './App'
import store from './store'
import router from './router'
import { eventBus } from './utils/vue/eventbus'
import '@/styles/fonts/loadSans'
import { watchSessions } from './utils/jms/auth'

import { installSvgIcon } from '@/icons' // icon
import '@/guards' // permission control
import { installDirectives } from '@/directive'
import { installFilters } from '@/filters'
import i18n, { fetchTranslationsFromAPI } from './i18n/i18n'
import ChartsPlugin from '@/libs/charts'
import { setupErrorHandler } from '@/libs/errors'
import CookiePlugin from '@/libs/cookie'
import request from '@/utils/request'
import { message } from '@/utils/vue/message'
import xss from '@/utils/secure'
import VSanitize from 'v-sanitize'
import moment from 'moment'
import _ from 'lodash'

moment.locale('zh-cn')

configureCompat({
  MODE: 2
})

async function initApp() {
  const app = createApp(App)

  // i18n helpers (set immediately to avoid undefined)
  const identityT = (key, ...rest) => {
    try {
      return i18n.global.t(key, ...rest)
    } catch (e) {
      return key
    }
  }
  const identityTc = (key, choice, ...rest) => {
    try {
      return i18n.global.tc(key, choice, ...rest)
    } catch (e) {
      return key
    }
  }
  app.config.globalProperties.$t = identityT
  app.config.globalProperties.$tc = identityTc

  app.use(store)
  app.use(router)
  app.use(i18n)
  app.use(ElementPlus, { locale: enLocale })
  app.use(CookiePlugin)
  app.use(ChartsPlugin)
  app.use(VSanitize, {
    allowedClasses: {
      '*': ['*']
    }
  })

  installDirectives(app)
  installFilters(app)
  installSvgIcon(app)

  app.config.globalProperties.$moment = moment
  app.config.globalProperties.$axios = request
  app.config.globalProperties.$message = message
  app.config.globalProperties.$xss = xss
  app.config.globalProperties.$eventBus = eventBus
  app.config.globalProperties._ = _
  app.config.globalProperties.$log = console
  // Override with i18n-bound functions after plugin install
  app.config.globalProperties.$t = identityT
  app.config.globalProperties.$tc = identityTc

  // 设置全局错误处理器
  setupErrorHandler(app, message)

  window._ = _

  await fetchTranslationsFromAPI()
  watchSessions()
  // Mount app and remove initial loading overlay
  app.mount('#app')
  try {
    const el = document.getElementById('loading')
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  } catch (e) {
    // ignore
  }
}

initApp().then()
