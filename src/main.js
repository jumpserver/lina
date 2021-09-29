import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'elementCss'
import locale from 'elementLocale'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import i18n from './i18n/i18n'

import '@/icons' // icon
import '@/guards' // permission control
import '@/directive'

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

Vue.config.productionTip = false

// cookie
import VueCookie from 'vue-cookie'
Vue.use(VueCookie)
window.$cookie = VueCookie

const moment = require('moment')
require('moment/locale/zh-cn')
Vue.use(require('vue-moment'), {
  moment
})

// logger
import VueLogger from 'vuejs-logger'
import loggerOptions from './utils/logger'
Vue.use(VueLogger, loggerOptions)

import ECharts from 'vue-echarts'
Vue.component('echarts', ECharts)

import service from '@/utils/request'

// lodash
// import _ from 'lodash'
window._ = require('lodash')
// Vue.set(Vue.prototype, '_', _)

// if the table component cannot access `this.$axios`, it cannot send request
Vue.prototype.$axios = service
// 注册全局事件总线
Vue.prototype.$eventBus = new Vue()
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: h => h(App)
})
