import Cookies from 'js-cookie'

export function getBasePath() {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.__BASE_PATH__ || ''
}

export function getCookiePath() {
  return getBasePath() || '/'
}

function getLocalStoragePrefix() {
  const basePath = getBasePath()
  return basePath ? `${basePath}:` : ''
}

function getScopedStorageKey(key) {
  const normalizedKey = String(key)
  const prefix = getLocalStoragePrefix()
  return prefix ? `${prefix}${normalizedKey}` : normalizedKey
}

function getRawLocalStorage() {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

export const scopedLocalStorage = {
  get length() {
    const storage = getRawLocalStorage()
    if (!storage) {
      return 0
    }
    const prefix = getLocalStoragePrefix()
    if (!prefix) {
      return storage.length
    }
    let count = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(prefix)) {
        count++
      }
    }
    return count
  },
  key(index) {
    const storage = getRawLocalStorage()
    if (!storage) {
      return null
    }
    const prefix = getLocalStoragePrefix()
    if (!prefix) {
      return storage.key(index)
    }
    let scopedIndex = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (!key || !key.startsWith(prefix)) {
        continue
      }
      if (scopedIndex === index) {
        return key.slice(prefix.length)
      }
      scopedIndex++
    }
    return null
  },
  getItem(key) {
    const storage = getRawLocalStorage()
    if (!storage) {
      return null
    }
    return storage.getItem(getScopedStorageKey(key))
  },
  setItem(key, value) {
    const storage = getRawLocalStorage()
    if (!storage) {
      return
    }
    storage.setItem(getScopedStorageKey(key), value)
  },
  removeItem(key) {
    const storage = getRawLocalStorage()
    if (!storage) {
      return
    }
    storage.removeItem(getScopedStorageKey(key))
  },
  clear() {
    const storage = getRawLocalStorage()
    if (!storage) {
      return
    }
    const prefix = getLocalStoragePrefix()
    if (!prefix) {
      storage.clear()
      return
    }
    const keys = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }
    keys.forEach((key) => storage.removeItem(key))
  }
}

function normalizeCookieOptions(options) {
  const nextOptions =
    options && typeof options === 'object' && !(options instanceof Date) ? { ...options } : {}

  if (
    options !== undefined &&
    (options === null || typeof options !== 'object' || options instanceof Date)
  ) {
    nextOptions.expires = options
  }

  if (!nextOptions.path) {
    nextOptions.path = getCookiePath()
  }
  return nextOptions
}

export const jsCookie = Cookies

if (!jsCookie.__BASE_PATH_SCOPED__) {
  const originalSet = jsCookie.set.bind(jsCookie)
  const originalRemove = jsCookie.remove.bind(jsCookie)

  jsCookie.set = (name, value, options) => {
    return originalSet(name, value, normalizeCookieOptions(options))
  }

  jsCookie.remove = (name, options) => {
    return originalRemove(name, normalizeCookieOptions(options))
  }

  jsCookie.__BASE_PATH_SCOPED__ = true
}

export const vueCookie = {
  get(name) {
    return jsCookie.get(name)
  },
  getCookie(name) {
    return jsCookie.get(name)
  },
  set(name, value, options) {
    return jsCookie.set(name, value, normalizeCookieOptions(options))
  },
  setCookie(name, value, options) {
    return jsCookie.set(name, value, normalizeCookieOptions(options))
  },
  delete(name, options) {
    return jsCookie.remove(name, normalizeCookieOptions(options))
  },
  removeCookie(name, options) {
    return jsCookie.remove(name, normalizeCookieOptions(options))
  }
}
