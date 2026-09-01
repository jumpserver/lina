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

export function resolveExpireSoonNoticeMinutes(enabled, minutes, defaultMinutes) {
  return enabled && (minutes === null || minutes === undefined) ? defaultMinutes : minutes
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
  delete value[`${prefix}expire_notice_policy`]
  return value
}
