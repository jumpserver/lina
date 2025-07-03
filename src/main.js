import Vue from 'vue'
import ElementUI from 'elementui-lts'
import locale from 'elementLocale'
import '@/styles/index.scss' // global css
import App from './App'
import store from './store'
import router from './router'
import i18n, { fetchTranslationsFromAPI } from './i18n/i18n'
import { eventBus } from './utils/const'
import '@/styles/fonts/loadSans'
import { watchSessions } from './utils/auth'

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
import moment from 'moment'
moment.locale('zh-cn')

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
ElementUI.Tooltip.props.openDelay.default = 1000
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.use(ElTableTooltipPatch)

Vue.config.productionTip = false

Vue.use(VueCookie)
window.$cookie = VueCookie

Vue.prototype.$moment = moment

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

async function initApp() {
  await fetchTranslationsFromAPI()
  watchSessions()

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
}

initApp().then()
