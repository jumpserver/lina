import moment from 'moment'

export function safeDate(s) {
  s = cleanDateStr(s)
  return new Date(s)
}

export function cleanDateStr(d) {
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
  m = m < 10 ? '0' + m : m
  let d = date.getDate()
  d = d < 10 ? '0' + d : d
  let h = date.getHours()
  h = h < 10 ? '0' + h : h
  let minute = date.getMinutes()
  let second = date.getSeconds()
  minute = minute < 10 ? '0' + minute : minute
  second = second < 10 ? '0' + second : second
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
  return y + '-' + m + '-' + d + 'T' + h + ':' + minute + ':' + second
}

// 将标准时间转换成时间戳
export function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, '/'))
}
