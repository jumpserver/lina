import { createApp, configureCompat } from 'vue'
import ElementPlus from 'element-plus'
import enLocale from 'element-plus/dist/locale/en.mjs'
import 'element-plus/dist/index.css'
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
import { VueCookieNext } from 'vue-cookie-next'
import { VueECharts } from 'vue-echarts'
import i18n, { fetchTranslationsFromAPI } from './i18n/i18n'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  RadarChart,
  GaugeChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components'
import request from '@/utils/request'
import { message } from '@/utils/vue/message'
import xss from '@/utils/secure'
import VSanitize from 'v-sanitize'
import moment from 'moment'
import _ from 'lodash'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  RadarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent
])

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
  app.use(VueCookieNext)
  // Register both legacy and new names to avoid resolution warnings
  app.component('echarts', VueECharts)
  app.component('Echart', VueECharts)
  app.component('Echarts', VueECharts)
  app.use(VSanitize, {
    allowedClasses: {
      '*': ['*']
    }
  })

  installDirectives(app)
  installFilters(app)
  installSvgIcon(app)

  const cookieCompat = {
    get: VueCookieNext.getCookie.bind(VueCookieNext),
    set: VueCookieNext.setCookie.bind(VueCookieNext),
    delete: VueCookieNext.removeCookie.bind(VueCookieNext),
    getCookie: VueCookieNext.getCookie.bind(VueCookieNext),
    setCookie: VueCookieNext.setCookie.bind(VueCookieNext),
    removeCookie: VueCookieNext.removeCookie.bind(VueCookieNext)
  }

  app.config.globalProperties.$moment = moment
  app.config.globalProperties.$axios = request
  app.config.globalProperties.$message = message
  app.config.globalProperties.$xss = xss
  app.config.globalProperties.$eventBus = eventBus
  app.config.globalProperties._ = _
  app.config.globalProperties.$log = console
  app.config.globalProperties.$cookie = cookieCompat
  // Override with i18n-bound functions after plugin install
  app.config.globalProperties.$t = identityT
  app.config.globalProperties.$tc = identityTc
  app.mixin({
    beforeCreate() {
      if (typeof this.$t !== 'function') {
        this.$t = identityT
      }
      if (typeof this.$tc !== 'function') {
        this.$tc = identityTc
      }
    },
    methods: {
      $t(...args) {
        return identityT(...args)
      },
      $tc(...args) {
        return identityTc(...args)
      }
    }
  })
  window.$cookie = cookieCompat
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
