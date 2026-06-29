const env = import.meta.env

function normalizeJoin(base, url) {
  if (!base) {
    return url
  }
  if (!url) {
    return base
  }
  if (/^(https?:)?\/\//.test(url)) {
    return url
  }
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

export const IS_DEV = env.DEV
export const IS_PROD = env.PROD
export const NODE_ENV = IS_DEV ? 'development' : 'production'
export const APP_ENV = env.VITE_APP_ENV || NODE_ENV
export const BASE_API = env.VITE_BASE_API || ''
export const LOGIN_PATH = env.VITE_LOGIN_PATH || '/core/auth/login/'
export const LOGOUT_PATH = env.VITE_LOGOUT_PATH || '/core/auth/logout/'
export const KAEL_HOST = env.VITE_KAEL_HOST || ''
export const WS_PORT = env.VITE_WS_PORT || ''

export function withBaseApi(url) {
  return IS_PROD ? url : normalizeJoin(BASE_API, url)
}
