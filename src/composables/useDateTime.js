import { getLangCode } from '@/i18n/utils'
import store from '@/store'
import moment from 'moment'
import { getDayFuture, safeDate } from '@/utils/common/time'

/**
 * 根据浏览器时区获取日期格式
 * @returns {string} 'YYYY-MM-DD' 或 'MM/DD/YYYY'
 */
function getDateFormatByTimezone() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // 美洲地区使用 MM/DD/YYYY 格式
    if (timezone && (timezone.startsWith('America/') || timezone.startsWith('US/'))) {
      return 'MM/DD/YYYY'
    }
    // 其他地区（含 Asia、Europe 等）使用 YYYY-MM-DD 格式
    return 'YYYY-MM-DD'
  } catch (e) {
    // 浏览器不支持获取时区时 fallback
    return 'YYYY-MM-DD'
  }
}

function getTimeUnits(unit) {
  const units = {
    d: '天',
    h: '时',
    m: '分',
    s: '秒'
  }
  if (getLangCode(true) === 'zh-hans') {
    return units[unit]
  }
  return unit
}

function readableSecond(offset) {
  const days = offset / 3600 / 24
  const hours = offset / 3600
  const minutes = offset / 60
  const seconds = offset

  if (days > 1) {
    return `${days.toFixed(1)} ${getTimeUnits('d')}`
  }
  if (hours > 1) {
    return `${hours.toFixed(1)} ${getTimeUnits('h')}`
  }
  if (minutes > 1) {
    return `${minutes.toFixed(1)} ${getTimeUnits('m')}`
  }
  if (seconds >= 0) {
    return `${seconds.toFixed(1)} ${getTimeUnits('s')}`
  }
  return ''
}

export function timeOffset(a, b) {
  const start = safeDate(a)
  const end = safeDate(b)
  const offset = (end - start) / 1000
  return readableSecond(offset)
}

export function toSafeLocalDateStr(value) {
  if ([null, undefined, ''].includes(value)) {
    return '-'
  }
  const date = safeDate(value)
  const dateFormat = getDateFormatByTimezone()
  return moment(date).format(`${dateFormat} HH:mm:ss`)
}

export function getDefaultExpiredDays() {
  const years = store.getters.publicSettings.DEFAULT_EXPIRED_YEARS
  return getDayFuture(years * 365, new Date()).toISOString()
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  return format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
}

export function formatTime(time, option) {
  if (`${time}`.length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const date = new Date(time)
  const now = Date.now()
  const diff = (now - date) / 1000

  if (diff < 30) {
    return '刚刚'
  }
  if (diff < 3600) {
    return `${Math.ceil(diff / 60)}分钟前`
  }
  if (diff < 3600 * 24) {
    return `${Math.ceil(diff / 3600)}小时前`
  }
  if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  }
  return `${date.getMonth() + 1}月${date.getDate()}日${date.getHours()}时${date.getMinutes()}分`
}

export function useDateTime() {
  return {
    formatTime,
    getDefaultExpiredDays,
    parseTime,
    timeOffset,
    toSafeLocalDateStr
  }
}
