import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import i18n from './i18n/i18n'

import '@/icons' // icon
import '@/permission' // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
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

import service from '@/utils/request'

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
