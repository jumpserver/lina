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

export const ADDRESS_TYPE_LABELS = {
  ipv4: 'IPv4',
  ipv6: 'IPv6',
  url: 'URL',
  domain: 'Domain',
  unknown: 'Unknown'
}
