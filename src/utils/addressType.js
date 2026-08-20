/*
 * 地址类型检测工具
 *
 * 通过正则识别输入值属于哪种地址类型，
 * 用于资产添加页面的 address/url 字段类型提示。
 */

const IPv4_RE = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

const DOMAIN_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

const URL_RE = /^https?:\/\/\S+$/i

function isIPv6(value) {
  if (!value.includes(':')) return false
  const v = value.split('%')[0]
  if (v.length < 2) return false
  if (v === '::') return true
  if (!/^[0-9a-fA-F:]+$/.test(v)) return false
  const colonCount = (v.match(/:/g) || []).length
  if (colonCount > 7) return false
  const groups = v.split(':').filter(g => g !== '')
  for (const g of groups) {
    if (g.length > 4 || !/^[0-9a-fA-F]+$/.test(g)) return false
  }
  return true
}

/**
 * @param {string} value
 * @returns {'ipv4'|'ipv6'|'url'|'domain'|'unknown'}
 */
export function detectAddressType(value) {
  if (!value || typeof value !== 'string') return 'unknown'
  const v = value.trim()
  if (!v) return 'unknown'
  if (URL_RE.test(v)) return 'url'
  if (IPv4_RE.test(v)) return 'ipv4'
  if (isIPv6(v)) return 'ipv6'
  if (DOMAIN_RE.test(v)) return 'domain'
  return 'unknown'
}

/*
 * 不同资产类型允许的地址类型。
 * host/device/database/ds 只允许 IP/域名，cloud/web 只允许 URL。
 */
export const ADDRESS_KINDS = {
  network: ['ipv4', 'ipv6', 'domain'],
  url: ['url']
}

/**
 * 判断地址是否属于允许的类型集合
 * @param {string} value
 * @param {Array<string>} kinds 允许的地址类型，如 ADDRESS_KINDS.network
 * @returns {boolean}
 */
export function isValidAddress(value, kinds) {
  if (!Array.isArray(kinds) || kinds.length === 0) return true
  return kinds.includes(detectAddressType(value))
}
