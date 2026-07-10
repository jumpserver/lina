import i18n from '@/i18n/i18n'

export const REPORT_DEBUG_SWITCH_KEY = '__REPORT_DEBUG_SWITCH__'

export const REPORT_RANGE_PRESET_OPTIONS = [
  { label: i18n.t('Today'), value: '1', days: 1 },
  { label: i18n.t('Last7Days'), value: '7', days: 7 },
  { label: i18n.t('Last30Days'), value: '30', days: 30 }
]

export const REPORT_ALLOWED_DAYS = REPORT_RANGE_PRESET_OPTIONS.map((item) => String(item.value))

export const REPORT_FILTER_QUERY_KEYS = ['days', 'report_id']

export const REPORT_PRESET_DAYS_MAP = REPORT_RANGE_PRESET_OPTIONS.reduce((acc, item) => {
  if (item.days) {
    acc[item.value] = item.days
  }
  return acc
}, {})

export function pickReportQuery(query = {}) {
  return REPORT_FILTER_QUERY_KEYS.reduce((acc, key) => {
    if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
      acc[key] = query[key]
    }
    return acc
  }, {})
}

export function appendQuery(url, query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  })
  const queryString = params.toString()
  if (!queryString) {
    return url
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`
}

export function getPresetLabel(value) {
  const preset = REPORT_RANGE_PRESET_OPTIONS.find((item) => item.value === value)
  return preset ? preset.label : value
}

export function normalizeReportDays(value, fallback = '7') {
  const normalizedFallback = REPORT_ALLOWED_DAYS.includes(String(fallback)) ? String(fallback) : '7'
  const normalizedValue = String(value || '')
  if (REPORT_ALLOWED_DAYS.includes(normalizedValue)) {
    return normalizedValue
  }
  return normalizedFallback
}

export function normalizeVisibleFilterList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (value === undefined || value === null || value === '') {
    return []
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function buildCustomReportRouteQuery(report = {}) {
  return {
    report_id: report.id
  }
}

export function isReportDebugEnabled() {
  try {
    const val = localStorage.getItem(REPORT_DEBUG_SWITCH_KEY)
    return val === '1' || val === 'true'
  } catch (e) {
    return false
  }
}

export function reportDebugLog(scope, payload = {}) {
  if (!isReportDebugEnabled()) {
    return
  }
  console.log(`[report-debug:${scope}]`, payload)
}

const _reportDetailInFlight = Object.create(null)
const _reportDetailCache = Object.create(null)
const REPORT_DETAIL_CACHE_TTL = 1500

export function fetchReportDetailShared(axios, reportId) {
  const url = `/api/v1/reports/reports/${reportId}/`
  const now = Date.now()
  const cached = _reportDetailCache[url]
  if (cached && now - cached.ts < REPORT_DETAIL_CACHE_TTL) {
    return Promise.resolve(cached.data)
  }
  if (_reportDetailInFlight[url]) {
    return _reportDetailInFlight[url]
  }
  const request = axios
    .get(url)
    .then((res) => {
      _reportDetailCache[url] = { ts: Date.now(), data: res }
      return res
    })
    .finally(() => {
      delete _reportDetailInFlight[url]
    })
  _reportDetailInFlight[url] = request
  return request
}

export function invalidateReportDetailCache(reportId) {
  const url = `/api/v1/reports/reports/${reportId}/`
  delete _reportDetailCache[url]
  delete _reportDetailInFlight[url]
}
