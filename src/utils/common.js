import i18n from '@/i18n/i18n'
import { message } from '@/utils/message'

const _ = require('lodash')

export function getApiPath(that, objectId) {
  let pagePath = that.$route.path
  const pagePathArray = pagePath.split('/')
  if (pagePathArray.indexOf('orgs') !== -1) {
    pagePathArray[pagePathArray.indexOf('xpack')] = 'orgs'
  } else if (pagePathArray.indexOf('gathered-user') !== -1 || pagePathArray.indexOf('change-auth-plan') !== -1) {
    pagePathArray[pagePathArray.indexOf('accounts')] = 'xpack'
  }
  if (pagePathArray.indexOf(objectId) === -1) {
    pagePathArray.push(objectId)
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

// 写个函数， id 设置到路径中，而不是 query 中, 确保已 / 结尾, 如果已 / 结尾，则不添加
export function setUrlId(url, id) {
  const urlArray = url.split('?')
  const baseUrl = _.trimEnd(urlArray[0], '/')
  if (urlArray.length === 1) {
    url = `${baseUrl}/${id}/`
  } else {
    url = `${baseUrl}/${id}/?${urlArray[1]}`
  }
  return url
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

export function getErrorResponseMsg(error) {
  let msg = ''
  let data = ''
  if (error?.response?.status === 500) {
    data = i18n.t('ServerError')
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
  } else {
    msg = error.toString()
  }
  return msg
}

function customizer(objValue, srcValue) {
  return _.isUndefined(objValue) ? srcValue : objValue
}

export function newURL(url) {
  let obj
  if (!url) {
    return ''
  }
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
  const timeout = 1000 * 60 * 30

  if (filename) {
    fetch(downloadUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = iframe.contentWindow.document.createElement('a')
        a.href = url
        a.download = filename
        iframe.contentWindow.document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          URL.revokeObjectURL(url)
          document.body.removeChild(iframe)
        }, timeout) // If you can't download it in half an hour, don't download it.
      })
      .catch(() => {
        document.body.removeChild(iframe)
      })
  } else {
    iframe.src = downloadUrl
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, timeout) // If you can't download it in half an hour, don't download it.
  }
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
    message: i18n.t('CopySuccess'),
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

const notUppercase = ['to', 'a', 'from', 'by']

export function toTitleCase(string) {
  if (!string) return string
  return string.trim().split(' ').map(item => {
    if (notUppercase.includes(item.toLowerCase())) {
      return item
    }
    return item[0].toUpperCase() + item.slice(1)
  }).join(' ')
}

export function toSentenceCase(string) {
  if (!string) return string
  if (string.indexOf('/') > 0) return string
  const s = string.trim().split(' ').map((item, index) => {
    if (item.length === 0) return ''
    if (item.length === 1) return item.toLowerCase()

    // 如果首字母大写，且第二个字母也大写，不处理
    if (item[0] === item[0].toUpperCase() && item[1] === item[1].toUpperCase()) {
      return item
    }

    if (index === 0) {
      return item[0].toUpperCase() + item.slice(1)
    }
    // 仅处理首字母大写，别的是小写的情况
    if (item[0] !== item[0].toLowerCase() && item.slice(1) === item.slice(1).toLowerCase()) {
      return item[0].toLowerCase() + item.slice(1)
    }
    return item
  }).join(' ')
  return s[0].toUpperCase() + s.slice(1)
}

export function toLowerCaseExcludeAbbr(s) {
  if (!s) return ''

  return s.split(' ').map(word => {
    // 如果单词包含超过 2 个大写字母，则不转换
    const uppercaseCount = word.split('').filter(char => {
      return char === char.toUpperCase() && char !== char.toLowerCase()
    }).length
    if (uppercaseCount > 2) {
      return word
    }
    // 否则将单词转换为小写
    return word.toLowerCase()
  }).join(' ')
}

export { BASE_URL }

export function openNewWindow(url) {
  let count
  let top = 50
  count = parseInt(window.sessionStorage.getItem('newWindowCount'), 10)
  if (isNaN(count)) {
    count = 0
  }
  let left = 100 + count * 100
  top = 50 + count * 50
  if (left + screen.width / 3 > screen.width) {
    // 支持两排足以
    top = screen.height / 3
    count = 1
    left = 100
  }
  let params = 'toolbar=yes,scrollbars=yes,resizable=yes'
  params = params + `,top=${top},left=${left},width=${screen.width / 3},height=${screen.height / 3}`
  window.sessionStorage.setItem('newWindowCount', `${count + 1}`)
  window.open(url, '_blank', params)
}

export function getDrawerWidth() {
  const drawerWidth = localStorage.getItem('drawerWidth')
  if (drawerWidth && drawerWidth > 100 && drawerWidth < 2000) {
    return drawerWidth + 'px'
  }
  const width = window.innerWidth
  if (width >= 1500) return '1080px'
  return '90%'
}

export class ObjectLocalStorage {
  constructor(key) {
    this.key = key
  }

  b64(val) {
    return btoa(unescape(encodeURIComponent(val)))
  }

  getObject() {
    const stored = window.localStorage.getItem(this.key)
    let value = {}
    try {
      value = JSON.parse(stored)
    } catch (e) {
      console.warn('localStorage value is not a valid JSON: ', this.key)
    }
    if (!value || typeof value !== 'object') {
      value = {}
    }
    return value
  }

  get(attr, defaults) {
    const obj = this.getObject(this.key)
    const attrSafe = this.b64(attr)
    const val = obj[attrSafe]
    if (val === undefined) {
      return defaults
    }
    return val
  }

  set(attr, value) {
    const obj = this.getObject(this.key)
    const attrSafe = this.b64(attr)
    obj[attrSafe] = value
    window.localStorage.setItem(this.key, JSON.stringify(obj))
  }
}
