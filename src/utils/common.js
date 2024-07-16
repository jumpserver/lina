import i18n from '@/i18n/i18n'
import { message } from '@/utils/message'

const _ = require('lodash')
const moment = require('moment')

function getTimeUnits(u) {
  const units = {
    'd': '天',
    'h': '时',
    'm': '分',
    's': '秒'
  }
  if (getUserLang() === 'zh-CN') {
    return units[u]
  }
  return u
}

export function timeOffset(a, b) {
  const start = safeDate(a)
  const end = safeDate(b)
  const offset = (end - start) / 1000
  return readableSecond(offset)
}

function readableSecond(offset) {
  const days = offset / 3600 / 24
  const hours = offset / 3600
  const minutes = offset / 60
  const seconds = offset

  if (days > 1) {
    return days.toFixed(1) + ' ' + getTimeUnits('d')
  } else if (hours > 1) {
    return hours.toFixed(1) + ' ' + getTimeUnits('h')
  } else if (minutes > 1) {
    return minutes.toFixed(1) + ' ' + getTimeUnits('m')
  } else if (seconds >= 0) {
    return seconds.toFixed(1) + ' ' + getTimeUnits('s')
  }
  return ''
}

function getUserLang() {
  const userLangEN = document.cookie.indexOf('django_language=en')
  if (userLangEN === -1) {
    return 'zh-CN'
  } else {
    return 'en-US'
  }
}

function safeDate(s) {
  s = cleanDateStr(s)
  return new Date(s)
}

function cleanDateStr(d) {
  for (let i = 0; i < 3; i++) {
    if (!isNaN(Date.parse(d))) {
      return d
    }
    if (!isNaN(Number(d)) || !d) {
      return d
    }
    switch (i) {
      case 0:
        d = d.split('/').join('-')
        break
      case 1:
        d = d.split('+')[0].trimRight()
        break
      case 2:
        d = d.replace(/-/g, '/')
    }
  }
  return d
}

export function toSafeLocalDateStr(d) {
  if ([null, undefined, ''].includes(d)) {
    return '-'
  }
  const date = safeDate(d)
  return moment(date).format('L LTS')
}

export function forMatAction(vm, d) {
  d.forEach(function(item, index, arr) {
    if ([
      vm.$t('perms.clipboardCopyPaste'),
      vm.$t('perms.upDownload'),
      vm.$t('perms.all')
    ].includes(item)) {
      arr.splice(index, 1)
    }
  })
  return d.join(', ')
}

export function getApiPath(that) {
  let pagePath = that.$route.path
  const pagePathArray = pagePath.split('/')
  if (pagePathArray.indexOf('orgs') !== -1) {
    pagePathArray[pagePathArray.indexOf('xpack')] = 'orgs'
  } else if (pagePathArray.indexOf('gathered-user') !== -1 || pagePathArray.indexOf('change-auth-plan') !== -1) {
    pagePathArray[pagePathArray.indexOf('accounts')] = 'xpack'
  }
  if (pagePathArray.indexOf('tickets') !== -1) {
    // ticket ...
    pagePath = pagePathArray.slice(1, pagePathArray.length).join('/')
  } else {
    // console,audit,workbench
    pagePath = pagePathArray.slice(2, pagePathArray.length).join('/')
  }
  return `/api/v1/${pagePath}/`
}

export function confirm({ msg, title, perform, success, failed, type = 'warning' }) {
  this.$alert(msg, title, {
    type: type,
    confirmButtonClass: 'el-button--info',
    showCancelButton: true,
    beforeClose: async(action, instance, done) => {
      if (action !== 'confirm') return done()
      instance.confirmButtonLoading = true
      try {
        await perform()
        done()
        if (typeof success === 'string') {
          this.$message.success(success)
        }
      } finally {
        instance.confirmButtonLoading = false
      }
    }
  })
}

export function formatDate(inputTime) {
  const date = new Date(inputTime)
  const y = date.getFullYear()
  let m = date.getMonth() + 1
  m = m < 10 ? ('0' + m) : m
  let d = date.getDate()
  d = d < 10 ? ('0' + d) : d
  let h = date.getHours()
  h = h < 10 ? ('0' + h) : h
  let minute = date.getMinutes()
  let second = date.getSeconds()
  minute = minute < 10 ? ('0' + minute) : minute
  second = second < 10 ? ('0' + second) : second
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
  return y + '-' + m + '-' + d + 'T' + h + ':' + minute + ':' + second
}

const uuidPattern = /[0-9a-zA-Z\-]{36}/
const uuidRegex = /\/([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12})\//

export function hasUUID(path) {
  const index = path.indexOf('?')
  if (index !== -1) {
    path = path.substring(0, index)
  }
  return path.search(uuidPattern) !== -1
}

export function getUuidUpdateFromUrl(path) {
  const matches = uuidRegex.exec(path)
  if (matches !== null) {
    return matches[1]
  } else {
    return ''
  }
}

export function replaceUUID(s, n) {
  const index = s.search(uuidPattern)
  if (index > 0) return s.substr(0, index)
  return s.replace(uuidPattern, n)
}

export function replaceAllUUID(string, replacement = '*') {
  if (hasUUID(string)) {
    string = string.replace(/[0-9a-zA-Z\-]{36}/g, replacement)
  }
  return string
}

export function getDaysAgo(days, now) {
  if (!now) {
    now = new Date()
  }
  return new Date(now.getTime() - 3600 * 1000 * 24 * days)
}

export function getDaysFuture(days, now) {
  if (!now) {
    now = new Date()
  }
  return new Date(now.getTime() + 3600 * 1000 * 24 * days)
}

export function getDayEnd(now) {
  if (!now) {
    now = new Date()
  }
  const zoneTime = moment(now).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  return moment(zoneTime).utc().toDate()
}

export function setUrlParam(url, name, value) {
  const urlArray = url.split('?')
  if (urlArray.length === 1) {
    url += '?' + name + '=' + value
  } else {
    const oriParam = urlArray[1].split('&')
    const oriParamMap = {}
    oriParam.forEach(function(value, index) {
      const v = value.split('=')
      oriParamMap[v[0]] = v[1]
    })
    oriParamMap[name] = value
    url = urlArray[0] + '?'
    const newParam = []
    for (const [key, value] of Object.entries(oriParamMap)) {
      newParam.push(key + '=' + value)
    }
    url += newParam.join('&')
  }
  return url
}

export function setRouterQuery(vm, url = '') {
  url = url || vm.tableConfig.url
  const params = url.split('?')[1]
  const query = Object.fromEntries(new URLSearchParams(params))
  const newQuery = {
    ...vm.$route.query,
    ...query
  }
  vm.$nextTick(() => {
    vm.$router.replace({ query: newQuery })
  })
}

export function getDayFuture(days, now) {
  if (!now) {
    now = new Date()
  }
  return new Date(now.getTime() + 3600 * 1000 * 24 * days)
}

export function getErrorResponseMsg(error) {
  let msg = ''
  let data = ''
  if (error?.response?.status === 500) {
    data = i18n.t('common.ServerError')
  } else {
    data = error?.response && error?.response.data || error
  }
  if (data && (data.error || data.msg || data.detail)) {
    msg = data.error || data.msg || data.detail
  } else if (data && data['non_field_errors']) {
    msg = data['non_field_errors'].join(' ')
  } else if (Array.isArray(data)) {
    msg = data.map((item, i) => {
      return getErrorResponseMsg(item)
    }).filter(i => i).join('; ')
  } else if (typeof data === 'string') {
    return data
  }
  return msg
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

function customizer(objValue, srcValue) {
  return _.isUndefined(objValue) ? srcValue : objValue
}

export function newURL(url) {
  let obj
  if (url.indexOf('//') > -1) {
    obj = new URL(url)
  } else {
    obj = new URL(url, location.origin)
  }
  return obj
}

export function getUpdateObjURL(url, objId) {
  const urlObj = new URL(url, location.origin)
  let pathname = urlObj.pathname
  if (!pathname.endsWith('/')) {
    pathname += '/'
  }
  pathname += `${objId}/`
  urlObj.pathname = pathname
  return urlObj.href
}

export function truncateCenter(s, l) {
  if (s.length <= l) {
    return s
  }
  const centerIndex = Math.ceil(l / 2)
  return s.slice(0, centerIndex - 2) + '...' + s.slice(centerIndex + 1, l)
}

export function truncateEnd(s, l) {
  if (s.length <= l) {
    return s
  }
  return s.slice(0, l - 3) + '...'
}

if (typeof String.prototype.replaceAll === 'undefined') {
  // eslint-disable-next-line no-extend-native
  String.prototype.replaceAll = function(match, replace) {
    return this.replace(new RegExp(match, 'g'), () => replace)
  }
}

export const assignIfNot = _.partialRight(_.assignInWith, customizer)

const scheme = document.location.protocol
const port = document.location.port ? ':' + document.location.port : ''
const BASE_URL = scheme + '//' + document.location.hostname + port

export function groupedDropdownToCascader(group) {
  const firstType = group[0]
  return {
    value: firstType.category,
    label: firstType.group,
    children: group.map(item => {
      return {
        value: item.name,
        label: item.title
      }
    })
  }
}

export function openWindow(url, name = '', iWidth = 900, iHeight = 600) {
  var iTop = (window.screen.height - 30 - iHeight) / 2
  var iLeft = (window.screen.width - 10 - iWidth) / 2
  window.open(url, name, 'height=' + iHeight + ',width=' + iWidth + ',top=' + iTop + ',left=' + iLeft)
}

/**
 * Download file
 * @param  {String} content
 * @param  {String} fileName
 */
export function downloadText(content, filename) {
  const blob = new Blob([content])
  const url = window.URL.createObjectURL(blob)
  download(url, filename)
}

export function download(downloadUrl, filename) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  const a = document.createElement('a')
  a.href = downloadUrl
  if (filename) {
    a.download = filename
  }
  iframe.contentWindow.document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 1000 * 60 * 30) // If you can't download it in half an hour, don't download it.
}

export function diffObject(object, base) {
  return _.transform(object, (result, value, key) => {
    if (!_.isEqual(value, base[key])) {
      result[key] = (_.isObject(value) && _.isObject(base[key])) ? diffObject(value, base[key]) : value
    }
  })
}

export const copy = _.throttle(function(value) {
  const inputDom = document.createElement('input')
  inputDom.id = 'createInputDom'
  inputDom.value = value
  document.body.appendChild(inputDom)
  inputDom.select()
  document?.execCommand('copy')
  message({
    message: i18n.t('common.CopySuccess'),
    type: 'success',
    duration: 1000
  })
  document.body.removeChild(inputDom)
}, 1400)

export function getQueryFromPath(path) {
  const url = new URL(path, location.origin)
  return Object.fromEntries(url.searchParams)
}

export const pageScroll = _.throttle((id) => {
  const dom = document.getElementById(id)
  if (dom) {
    dom.scrollTop = dom?.scrollHeight
  }
}, 200)

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export { BASE_URL }
