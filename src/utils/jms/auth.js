import { VueCookieNext as VueCookie } from 'vue-cookie-next'
import request from '@/utils/request'

const CURRENT_ORG_KEY = 'currentOrg'
const CURRENT_ROLE_KEY = 'currentRole'
let cookieNamePrefix = VueCookie.getCookie('SESSION_COOKIE_NAME_PREFIX')
if (!cookieNamePrefix || ['""', "''"].indexOf(cookieNamePrefix) > -1) {
  cookieNamePrefix = ''
}
const TOKEN_KEY = `${cookieNamePrefix}csrftoken`

export function getTokenFromCookie() {
  return VueCookie.getCookie(TOKEN_KEY)
}

export function setTokenToCookie(value, expires) {
  return VueCookie.setCookie(TOKEN_KEY, value, { expires: expires })
}

export function getCurrentRoleLocal(username) {
  const key = CURRENT_ROLE_KEY + ':' + username
  const role = localStorage.getItem(key)
  if (role) {
    return parseInt(role) || null
  }
  return role
}

export function saveCurrentRoleLocal(username, role) {
  const key = CURRENT_ROLE_KEY + ':' + username
  return localStorage.setItem(key, role)
}

export function getCurrentOrgLocal(username) {
  const key = CURRENT_ORG_KEY + ':' + username
  const value = localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return null
  }
}

export function saveCurrentOrgLocal(username, org) {
  const key = CURRENT_ORG_KEY + ':' + username
  if (org) {
    localStorage.setItem(key, JSON.stringify(org))
    VueCookie.setCookie('X-JMS-ORG', org.id)
  } else {
    localStorage.removeItem(key)
    VueCookie.removeCookie('X-JMS-ORG')
  }
}

export function setPreOrgLocal(username, org) {
  const key = 'preOrg' + ':' + username
  localStorage.setItem(key, JSON.stringify(org))
}

export function getPreOrgLocal(username) {
  const key = 'preOrg' + ':' + username
  const value = localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return null
  }
}

export function notifyWebSessionClose(close) {
  const url = '/api/v1/authentication/user-session/'
  const body = new URLSearchParams({ ...close, csrfmiddlewaretoken: getTokenFromCookie() || '' })
  try {
    if (navigator.sendBeacon?.(url, body)) return
  } catch {
    /* Fall back when the browser cannot queue a beacon. */
  }
  void request({
    url,
    method: 'post',
    data: close,
    disableFlashErrorMsg: true,
    adapter: 'fetch',
    fetchOptions: { keepalive: true }
  }).catch(() => {})
}
