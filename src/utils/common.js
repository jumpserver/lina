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
  } else if (seconds > 1) {
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
    if (!isNaN(Number(d))) {
      return d
    }
    switch (i) {
      case 0:
        d = d.replaceAll('-', '/')
        break
      case 1:
        d = d.split('+')[0].trimRight()
        break
    }
  }
  return null
}

export function toSafeLocalDateStr(d) {
  const date = safeDate(d)
  // var date_s = date.toLocaleString(getUserLang(), {hour12: false});
  const date_s = date.toLocaleString(getUserLang(), { hourCycle: 'h23' })
  return date_s.split('/').join('-')
}

export function getApiPath(that) {
  const pagePath = that.$route.path
  return `/api/v1${pagePath}/`
}
