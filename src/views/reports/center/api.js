import request from '@/utils/request'

const base = '/api/v1/reports/'
const options = { disableFlashErrorMsg: true }

export const reportApi = {
  catalog: async () => {
    const catalog = await request.get(`${base}audit-reports/catalog/`, options)
    return {
      ...catalog,
      chapters: catalog.chapters.filter(
        (chapter) => !['scope', 'assessment'].includes(chapter.key)
      ),
      themes: catalog.themes.map((theme) => ({
        ...theme,
        chapters: theme.chapters.filter((key) => !['scope', 'assessment'].includes(key))
      }))
    }
  },
  preview: (config) => request.post(`${base}audit-reports/preview/`, config, options)
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
    chapters: chapters.filter((key) => !['scope', 'assessment'].includes(key)),
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
    chapters: (config.chapters || []).filter((key) => !['scope', 'assessment'].includes(key)),
    title: config.title || '',
    header: config.header || '',
    conclusion: config.conclusion || '',
    show_logo: config.show_logo !== false
  }
}

// Evidence uses only known application routes, never arbitrary URLs from report data.
export function reportEvidenceLink(value) {
  if (!value || typeof value !== 'object' || typeof value.path !== 'string') {
    return ''
  }
  const riskTypes = [
    'long_time_no_login',
    'new_found',
    'account_deleted',
    'groups_changed',
    'sudoers_changed',
    'authorized_keys_changed',
    'password_expired',
    'long_time_password',
    'weak_password',
    'leaked_password',
    'repeated_password'
  ]
  if (value.kind === 'account_risk_group') {
    if (
      value.path !== '/pam/security/check' ||
      value.query?.tab !== 'AccountRisks' ||
      value.query?.status !== '0' ||
      !riskTypes.includes(value.query?.risk)
    ) {
      return ''
    }
    const query = new URLSearchParams({ tab: 'AccountRisks', risk: value.query.risk, status: '0' })
    if (value.org_id) query.set('oid', value.org_id)
    return `${location.origin}${import.meta.env.BASE_URL}#${value.path}?${query}`
  }
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.id || '')) {
    return ''
  }
  const aliases = {
    '/pam/account-change-secret/': '/pam/security/account-change-secret/',
    '/pam/account-backup/': '/pam/automations/account-backup/',
    '/pam/account-push/': '/pam/automations/account-push/',
    '/pam/account-discovery/': '/pam/automations/account-discovery/',
    '/pam/check/': '/pam/security/check/'
  }
  let path = value.path || ''
  for (const [legacy, current] of Object.entries(aliases)) {
    if (path.startsWith(legacy)) path = current + path.slice(legacy.length)
  }
  if (path === '/pam/check') path = '/pam/security/check'
  const paths = [
    '/audit/sessions/sessions/',
    '/audit/audits/login-logs/',
    '/audit/audits/operate-logs/',
    '/tickets/tickets/command-confirm/',
    '/pam/security/account-change-secret/executions/',
    '/pam/automations/account-backup/executions/',
    '/pam/automations/account-push/executions/',
    '/pam/automations/account-discovery/executions/',
    '/pam/security/check/executions/'
  ]
  const query = new URLSearchParams()
  if (value.org_id) query.set('oid', value.org_id)
  if (
    path === '/pam/security/check' &&
    value.query?.tab === 'AccountRisks' &&
    value.query?.id === value.id
  ) {
    query.set('tab', 'AccountRisks')
    query.set('id', value.id)
  } else if (!paths.some((prefix) => path === prefix + value.id)) {
    return ''
  }
  return `${location.origin}${import.meta.env.BASE_URL}#${path}${query.size ? `?${query}` : ''}`
}
