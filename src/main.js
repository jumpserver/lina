import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import '@fontsource/open-sans' // Defaults to weight 400
import '@fontsource/open-sans/300.css' // Specify weight
import '@fontsource/open-sans/300-italic.css' // Specify weight and style
import '@fontsource/open-sans/400.css' // Specify weight
import '@fontsource/open-sans/400-italic.css' // Specify weight and style
import '@fontsource/open-sans/500.css' // Specify weight
import '@fontsource/open-sans/500-italic.css' // Specify weight and style
import '@fontsource/open-sans/600.css' // Specify weight
import '@fontsource/open-sans/600-italic.css' // Specify weight and style
import '@fontsource/open-sans/700.css' // Specify weight
import '@fontsource/open-sans/700-italic.css' // Specify weight and style
import ElementUI from 'element-ui'
import locale from 'elementLocale'
import '@/styles/index.scss' // global css
import App from './App'
import store from './store'
import router from './router'
import i18n from './i18n/i18n'
import { eventBus } from './utils/const'

import '@/icons' // icon
import '@/guards' // permission control
import '@/directive'
import '@/filters'
// cookie
import VueCookie from 'vue-cookie'
import VueLogger from 'vuejs-logger'
import loggerOptions from './utils/logger'
import ECharts from 'vue-echarts'
import request from '@/utils/request'
import { message } from '@/utils/message'
import xss from '@/utils/xss'
import ElTableTooltipPatch from '@/utils/elTableTooltipPatch.js'
import VSanitize from 'v-sanitize'
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'development') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.use(ElTableTooltipPatch)

Vue.config.productionTip = false

Vue.use(VueCookie)
window.$cookie = VueCookie

const moment = require('moment')
require('moment/locale/zh-cn')
Vue.use(require('vue-moment'), {
  moment
})

Vue.use(VueLogger, loggerOptions)

Vue.component('echarts', ECharts)

Vue.prototype.$axios = request

window._ = require('lodash')
// Vue.set(Vue.prototype, '_', _)

Vue.prototype.$message = message

Vue.prototype.$xss = xss
Vue.use(VSanitize, {
  allowedClasses: {
    '*': ['*']
  }
})

// 注册全局事件总线
Vue.prototype.$eventBus = eventBus

new Vue({
  el: '#app',
  i18n,
  router,
  store,
  mounted() {
    // 移除加载页面
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none'
      }, 500)
    }
  },
  render: h => h(App)
})

;(function() {
  request({
    url: '/api/v1/authentication/user-session/',
    method: 'get',
    disableFlashErrorMsg: true
  })
})()

let IdBeforeunload = false

window.addEventListener('beforeunload', (event) => {
  if (IdBeforeunload) return
  IdBeforeunload = true
  request({
    url: '/api/v1/authentication/user-session/',
    method: 'delete',
    disableFlashErrorMsg: true
  })
})
