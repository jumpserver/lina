import axios from 'axios'
import i18n from '@/i18n/i18n'

import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import {
  getToken,
  getCurrentOrg
} from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60 * 1000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-CSRFToken'] = getToken()
      if (getCurrentOrg().id !== '') { config.headers['X-JMS-ORG'] = getCurrentOrg().id }
    }
    try {
      config.headers['X-TZ'] = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (e) {
      console.log('Current browser not support Intl tools')
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

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
    const res = response.data

    if (response.config.raw === 1) {
      return response
    }
    return res
  },
  error => {
    if (!error.response) {
      return Promise.reject(error)
    }
    const response = error.response
    if (response.status === 401) {
      // 未授权重定向到登录页面
      const title = ''
      const msg = i18n.t('auth.LoginRequiredMsg')
      MessageBox.confirm(msg, title, {
        confirmButtonText: i18n.t('auth.ReLogin'),
        cancelButtonText: i18n.t('common.Cancel'),
        type: 'warning'
      })
    }
    if (!response.config.disableFlashMsg) {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
