import axios from 'axios'
import i18n from '@/i18n/i18n'
import { eventBus } from '@/utils/const'
import { getTokenFromCookie } from '@/utils/auth'
import { getErrorResponseMsg } from '@/utils/common'
import { MessageBox } from 'elementui-lts'
import { message } from '@/utils/message'
import store from '@/store'
import axiosRetry from 'axios-retry'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 2 * 60 * 1000 // request timeout
})

function beforeRequestAddToken(config) {
  const csrfToken = getTokenFromCookie()
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  const queryOrgId = router.currentRoute.query?.oid
  const storeOrgId = store.getters.currentOrg?.id
  const orgId = queryOrgId || storeOrgId
  if (orgId) {
    config.headers['X-JMS-ORG'] = orgId
  }
}

function beforeRequestAddTimezone(config) {
  try {
    config.headers['X-TZ'] = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    // debug('Current browser not support Intl tools')
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
    // debug(error) // for debug
    return Promise.reject(error)
  }
)

function goToLogin() {
  setTimeout(() => {
    window.location = process.env.VUE_APP_LOGIN_PATH + '?next=' + window.location.pathname
  }, 200)
  localStorage.setItem('next', window.location.hash.replace('#', ''))
}

function ifUnauthorized({ response, error }) {
  if (response.status === 401) {
    response.config.disableFlashErrorMsg = true
    if (response.request.responseURL.indexOf('/users/profile/') !== -1) {
      goToLogin()
      return
    }
    const title = i18n.tc('Info')
    const msg = i18n.tc('LoginRequiredMsg')
    MessageBox.confirm(msg, title, {
      confirmButtonText: i18n.t('ReLogin'),
      cancelButtonText: i18n.t('Cancel'),
      type: 'warning'
    }).then(() => {
      goToLogin()
    })
  }
}

function ifBadRequest({ response, error }) {
  if (response.status === 400) {
    if (response.data?.detail) {
      error.message = response.data.detail
    } else {
      error.message = i18n.t('BadRequestErrorMsg')
    }
  }
  if (response.status === 403) {
    error.message = i18n.t('BadRoleErrorMsg')
  }
  if (response.status === 409) {
    error.response.status = 409
    error.message = i18n.t('BadConflictErrorMsg')
  }
}

export function logout() {
  window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${location.pathname}`
}

export function flashErrorMsg({ response, error }) {
  if (!response.config.disableFlashErrorMsg) {
    const responseErrorMsg = getErrorResponseMsg(error)
    const msg = responseErrorMsg || error.message

    if (response.status === 403 && msg === 'CSRF Failed: CSRF token missing.') {
      setTimeout(() => {
        logout()
      }, 1000)
    }
    message({
      message: msg,
      type: 'error',
      duration: 5 * 1000
    })
  }
}

function ifConfirmRequired({ response, error }) {
  if (response.status !== 412) {
    return null
  }
  return new Promise((resolve, reject) => {
    const callback = () => resolve()
    const cancel = () => reject()

    eventBus.$emit('showConfirmDialog', { response, callback, cancel })
  })
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
    store.dispatch('common/digestSQLQuery', response).then()

    if (response.config.raw === 1) {
      return response
    }
    return res
  },
  async error => {
    // NProgress.done()
    if (!error.response) {
      return Promise.reject(error)
    }
    const response = error.response

    const confirming = ifConfirmRequired({ response, error })

    if (confirming) {
      return new Promise((resolve, reject) => {
        confirming.then(() => {
          resolve(service(error.config))
        }).catch(() => {
          reject(error)
        })
      })
    }

    await ifUnauthorized({ response, error })
    await ifBadRequest({ response, error })
    await flashErrorMsg({ response, error })
    return Promise.reject(error)
  }
)

axiosRetry(service, {
  // 默认不开启请求重试
  retries: 0
})

export function fetchAllData(url, params) {
  const allData = []

  function fetchPage(url) {
    return service({
      url,
      method: 'get',
      params: {
        ...params
      }
    }).then(res => {
      allData.push(...res.results)
      if (res.next) {
        return fetchPage(res.next)
      } else {
        return allData
      }
    })
  }

  return fetchPage(url)
}

export default service
