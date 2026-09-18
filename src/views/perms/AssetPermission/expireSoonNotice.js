function toTimestamp(value) {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

const FALLBACK_EXPIRE_SOON_NOTICE_MINUTES = 15

export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0
}

export function getDefaultExpireSoonNoticeMinutes(publicSettings) {
  return publicSettings.PERM_EXPIRED_SOON_NOTICE_MINUTES ?? FALLBACK_EXPIRE_SOON_NOTICE_MINUTES
}

export function hydrateExpireNoticeFormValue(value, prefix = '', defaultMinutes) {
  const switchKey = `${prefix}expire_soon_notice_switch`
  const minutesKey = `${prefix}expire_soon_notice_minutes`
  const enabled = isPositiveInteger(value[minutesKey])
  value[switchKey] = enabled
  value[minutesKey] = enabled ? value[minutesKey] : defaultMinutes
  return value
}

export function getExpireSoonNoticeAt(dateExpired, minutes) {
  const expired = toTimestamp(dateExpired)
  const noticeMinutes = Number(minutes)
  if (expired === null || !isPositiveInteger(noticeMinutes)) {
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

export function isExpireSoonNoticeAtFuture(dateExpired, minutes) {
  const noticeAt = getExpireSoonNoticeAt(dateExpired, minutes)
  return noticeAt !== null && noticeAt.getTime() > Date.now()
}

export function normalizeExpireNoticePayload(value, prefix = '') {
  const switchKey = `${prefix}expire_soon_notice_switch`
  const minutesKey = `${prefix}expire_soon_notice_minutes`
  if (!value[switchKey]) {
    value[minutesKey] = null
  }
  delete value[switchKey]
  delete value[`${prefix}expire_notice_policy`]
  return value
}
