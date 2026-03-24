import i18n from '@/i18n/i18n'

export const REPORT_RANGE_PRESET_OPTIONS = [
  { label: i18n.t('LastDay'), value: 'last_day', days: 1 },
  { label: i18n.t('Last7Days'), value: 'last_week', days: 7 },
  { label: i18n.t('Last30Days'), value: 'last_month', days: 30 },
  { label: i18n.t('LastThreeMonths'), value: 'last_three_months', days: 90 },
  { label: i18n.t('LastHalfYear'), value: 'last_half_year', days: 180 },
  { label: i18n.t('LastYear'), value: 'last_year', days: 365 },
  { label: i18n.t('Custom'), value: 'custom', days: null }
]

export const REPORT_FILTER_QUERY_KEYS = [
  'start',
  'end',
  'range_preset',
  'user_id',
  'asset_id',
  'account',
  'report_id'
]

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

export function isSameReportQuery(currentQuery = {}, nextQuery = {}) {
  return JSON.stringify(pickReportQuery(currentQuery)) === JSON.stringify(pickReportQuery(nextQuery))
}

export function appendQuery(url, query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  })
  const queryString = params.toString()
  if (!queryString) {
    return url
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`
}

export function getPresetLabel(value) {
  const preset = REPORT_RANGE_PRESET_OPTIONS.find(item => item.value === value)
  return preset ? preset.label : value
}
