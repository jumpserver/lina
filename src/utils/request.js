import axios from 'axios'
import i18n from '@/i18n/i18n'
import { getTokenFromCookie } from '@/utils/auth'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60 * 1000 // request timeout
})

function beforeRequestAddToken(config) {
  const csrfToken = getTokenFromCookie()
  if (csrfToken) {
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    config.headers['X-CSRFToken'] = csrfToken
  }
  if (store.getters.currentOrg) {
    config.headers['X-JMS-ORG'] = store.getters.currentOrg.id
  }
}

function beforeRequestAddTimezone(config) {
  try {
    config.headers['X-TZ'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    console.log('Current browser not support Intl tools')
  }
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // NProgress.start()
    beforeRequestAddToken(config)
    beforeRequestAddTimezone(config)
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

function ifUnauthorized({ response, error }) {
  if (response.status === 401) {
    response.config.disableFlashErrorMsg = true
    if (response.request.responseURL.indexOf('/users/profile/') !== -1) {
      window.location = '/core/auth/login/'
      return
    }
    const title = i18n.t('common.Info')
    const msg = i18n.t('auth.LoginRequiredMsg')
    MessageBox.confirm(msg, title, {
      confirmButtonText: i18n.t('auth.ReLogin'),
      cancelButtonText: i18n.t('common.Cancel'),
      type: 'warning'
    }).then(() => {
      window.location = '/core/auth/login/'
    })
  }
}

function ifBadRequest({ response, error }) {
  if (response.status === 400) {
    error.message = i18n.t('common.BadRequestErrorMsg')
  }
}

export function flashErrorMsg({ response, error }) {
  if (!response.config.disableFlashErrorMsg) {
    let msg = error.message
    const data = response.data
    if (data && (data.error || data.msg)) {
      msg = data.error || data.msg
    }
    Message({
      message: msg,
      type: 'error',
      duration: 5 * 1000
    })
  }
}

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // NProgress.done()
    const res = response.data

    if (response.config.raw === 1) {
      return response
    }
    return res
  },
  error => {
    // NProgress.done()
    if (!error.response) {
      return Promise.reject(error)
    }

    const response = error.response
    ifUnauthorized({ response, error })
    ifBadRequest({ response, error })
    flashErrorMsg({ response, error })
    return Promise.reject(error)
  }
)

export default service
