function toTimestamp(value) {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export function getShortNoticeAt(dateExpired, minutes) {
  const expired = toTimestamp(dateExpired)
  const noticeMinutes = Number(minutes)
  if (expired === null || !Number.isInteger(noticeMinutes) || noticeMinutes <= 0) {
    return null
  }
  return new Date(expired - noticeMinutes * 60000)
}

export function formatNoticeDate(value) {
  const pad = (number) => String(number).padStart(2, '0')
  return (
    [value.getFullYear(), pad(value.getMonth() + 1), pad(value.getDate())].join('-') +
    ` ${pad(value.getHours())}:${pad(value.getMinutes())}`
  )
}

export function isShortNoticeAtFuture(dateExpired, minutes) {
  const noticeAt = getShortNoticeAt(dateExpired, minutes)
  return noticeAt !== null && noticeAt.getTime() > Date.now()
}

export function normalizeExpireNoticePayload(value, prefix = '') {
  delete value[`${prefix}expire_notice_policy`]
  return value
}
