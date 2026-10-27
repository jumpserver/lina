import request from '@/utils/request'

const base = '/api/v1/reports/'
const options = { disableFlashErrorMsg: true }

export const reportApi = {
  catalog: () => request.get(`${base}audit-reports/catalog/`, options),
  preview: (config) => request.post(`${base}audit-reports/preview/`, config, options),
  templates: (params = {}) => request.get(`${base}audit-report-templates/`, { ...options, params }),
  template: (id) =>
    request.get(`${base}audit-report-templates/${encodeURIComponent(id)}/`, options),
  saveTemplate: (data, id) =>
    id
      ? request.patch(`${base}audit-report-templates/${encodeURIComponent(id)}/`, data, options)
      : request.post(`${base}audit-report-templates/`, data, options),
  deleteTemplate: (id) =>
    request.delete(`${base}audit-report-templates/${encodeURIComponent(id)}/`, options)
}

export function listData(response) {
  if (Array.isArray(response)) return { results: response, count: response.length }
  return { results: response?.results || [], count: response?.count || 0 }
}

export function reportError(error, fallback) {
  const messages = []
  const collect = (value) => {
    if (typeof value === 'string') messages.push(value)
    else if (Array.isArray(value)) value.forEach(collect)
    else if (value && typeof value === 'object') Object.values(value).forEach(collect)
  }
  collect(error?.response?.data)
  return messages.length ? messages.join('；') : error?.message || fallback
}

export function localDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function defaultRange() {
  const now = new Date()
  return {
    start: localDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: localDate(now)
  }
}

export function makeConfig(theme, chapters, range = defaultRange()) {
  return {
    theme,
    ...range,
    chapters: [...chapters],
    title: '',
    header: '',
    conclusion: '',
    show_logo: true
  }
}

export function configPayload(config) {
  return {
    theme: config.theme,
    start: config.start,
    end: config.end,
    chapters: [...(config.chapters || [])],
    title: config.title || '',
    header: config.header || '',
    conclusion: config.conclusion || '',
    show_logo: config.show_logo !== false
  }
}
