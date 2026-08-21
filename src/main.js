import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { getElementLocale } from '@/i18n/langs'
import { getLangCode } from '@/i18n/utils'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@fortawesome/fontawesome-free/css/v4-shims.min.css'
// 导入 Element Plus CSS 变量配置（需要在 Element Plus 样式之后，自定义样式之前）
import '@/styles/element-plus-vars.scss'
// 导入默认主题配置（包含 :root CSS 变量定义）
import '@/styles/default-theme.scss'
import '@/styles/index.scss' // global css
// 导入默认主题配置并初始化
import { setRootColors } from '@/utils/theme/color'
import App from './App.vue'
import store from './store'
import router from './router'
import { eventBus } from './utils/vue/eventbus'
import '@/styles/fonts/loadSans'
import { watchSessions } from './utils/jms/auth'

import { installSvgIcon } from '@/icons' // icon
import { installElementPlusIcons } from '@/icons/element-plus-icons'
import '@/guards' // permission control
import { installDirectives } from '@/directive'
import i18n, { fetchTranslationsFromAPI } from './i18n/i18n'
import ChartsPlugin from '@/libs/charts'
import createContextService from '@/libs/context'
import { setupErrorHandler } from '@/libs/errors'
import CookiePlugin from '@/libs/cookie'
import ResourceActivity from '@/components/Apps/ResourceActivity'
import request from '@/utils/request'
import { message } from '@/utils/vue/message'
import { toPlainTextMessage } from '@/utils/common/message'
import xss from '@/utils/secure'
import moment from 'moment'
import DOMPurify from 'dompurify'
import _ from 'lodash'
import { ElMessageBox } from 'element-plus'

moment.locale('zh-cn')

// 构建时间：生产环境为 Docker 构建时刻，开发环境为 dev server 启动时刻（见 vite.config.js）
// 用双色徽章样式打印，与其它 console 信息区分开。
console.log(
  `%c 🚀 Lina %c Build Time: ${__BUILD_TIME__} %c`,
  'background:#409eff;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold',
  'background:#1f2d3d;color:#67c23a;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:bold',
  'background:transparent'
)

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
  app.use(ElementPlus, {
    locale: getElementLocale(getLangCode()),
    size: 'small'
  })
  app.use(CookiePlugin)
  app.use(ChartsPlugin)
  app.use(createContextService({ router }))

  // v-sanitize: 手动注册(v-sanitize npm 包用 Vue.prototype 不兼容 Vue 3)
  const sanitizeOptions = {
    ALLOW_DATA_ATTR: true
  }
  app.config.globalProperties.$sanitize = (dirty, opts) =>
    DOMPurify.sanitize(dirty || '', { ...sanitizeOptions, ...opts })
  app.directive('sanitize', (el, binding) => {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = DOMPurify.sanitize(binding.value || '', sanitizeOptions)
    }
  })

  installDirectives(app)
  installSvgIcon(app)
  installElementPlusIcons(app)

  // 全局注册动态组件(被 GenericDetailPage submenu 按字符串 name 引用)
  app.component('ResourceActivity', ResourceActivity)

  app.config.globalProperties.$moment = moment
  app.config.globalProperties.$axios = request
  app.config.globalProperties.$message = message
  app.config.globalProperties.$alert = (msg, title, options = {}) => {
    const plainText = typeof msg === 'string' ? toPlainTextMessage(msg) : msg
    return ElMessageBox.alert(plainText, title, options)
  }
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
  // v-html 在模板编译阶段统一转换为 window.$xss.process(...)
  window.$xss = xss

  // 初始化默认主题变量（确保在应用启动时就注入 CSS 变量）
  setRootColors()

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
