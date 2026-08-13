import { VueCookieNext as VueCookie } from 'vue-cookie-next'
import request from '@/utils/request'
import { withBaseApi } from '@/utils/env'

const CURRENT_ORG_KEY = 'currentOrg'
const CURRENT_ROLE_KEY = 'currentRole'
let cookieNamePrefix = VueCookie.getCookie('SESSION_COOKIE_NAME_PREFIX')
if (!cookieNamePrefix || ['""', "''"].indexOf(cookieNamePrefix) > -1) {
  cookieNamePrefix = ''
}
const TOKEN_KEY = `${cookieNamePrefix}csrftoken`
const USER_SESSION_URL = '/api/v1/authentication/user-session/'
const DEFAULT_HEARTBEAT_INTERVAL = 30 * 1000

let heartbeatTimer = null
let heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL
let isWatchingSession = false
let sessionReleased = false

function createClientId() {
  if (typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }

  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join('-')
}

const sessionClientId = createClientId()

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

export function watchSessions() {
  if (isWatchingSession) {
    return
  }
  isWatchingSession = true

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      window.clearTimeout(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  const scheduleHeartbeat = () => {
    stopHeartbeat()
    if (sessionReleased) {
      return
    }
    heartbeatTimer = window.setTimeout(async () => {
      await renewSession()
      if (!sessionReleased) {
        scheduleHeartbeat()
      }
    }, heartbeatInterval)
  }

  const renewSession = async () => {
    try {
      const data = await request({
        url: USER_SESSION_URL,
        method: 'post',
        data: { client_id: sessionClientId },
        disableFlashErrorMsg: true
      })
      if (data?.ok === false) {
        sessionReleased = true
        stopHeartbeat()
        return
      }
      sessionReleased = false
      const interval = Number(data?.heartbeat_interval)
      if (interval > 0) {
        heartbeatInterval = interval * 1000
      }
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        sessionReleased = true
        stopHeartbeat()
      }
    }
  }

  const releaseSession = () => {
    if (sessionReleased) {
      return
    }
    sessionReleased = true
    stopHeartbeat()

    const csrfToken = getTokenFromCookie()
    const headers = { 'Content-Type': 'application/json' }
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
    fetch(withBaseApi(USER_SESSION_URL), {
      method: 'DELETE',
      credentials: 'same-origin',
      keepalive: true,
      headers,
      body: JSON.stringify({ client_id: sessionClientId })
    }).catch(() => {})
  }

  renewSession().then(scheduleHeartbeat)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      renewSession().then(scheduleHeartbeat)
    }
  })

  window.addEventListener('pageshow', () => {
    renewSession().then(scheduleHeartbeat)
  })

  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) {
      releaseSession()
    }
  })
}
