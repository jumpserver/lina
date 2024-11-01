const moment = require('moment')
import { getLangCode } from '@/i18n/utils'
import store from '@/store'

function getTimeUnits(u) {
  const units = {
    'd': '天',
    'h': '时',
    'm': '分',
    's': '秒'
  }
  if (getLangCode() === 'zh') {
    return units[u]
  } else {
    return u
  }
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

export function getDayFuture(days, now) {
  if (!now) {
    now = new Date()
  }
  return new Date(now.getTime() + 3600 * 1000 * 24 * days)
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
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

export function getDefaultExpiredDays() {
  const years = store.getters.publicSettings.DEFAULT_EXPIRED_YEARS
  return getDayFuture(years * 365, new Date()).toISOString()
}
