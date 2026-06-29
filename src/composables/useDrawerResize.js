const DEFAULT_STORAGE_KEY = 'drawerWidth'
const DEFAULT_FALLBACK_SIZE = '90%'
const LARGE_SCREEN_FALLBACK_SIZE = '1080px'
const LARGE_SCREEN_BREAKPOINT = 1500
const DEFAULT_MIN_WIDTH_RATIO = 0.2
const DEFAULT_MAX_WIDTH_RATIO = 0.8
const DEFAULT_MIN_WIDTH = 100
const DEFAULT_MAX_WIDTH = 2000

function getViewportWidth() {
  if (typeof window === 'undefined') {
    return null
  }
  return window.innerWidth || document.body?.clientWidth || null
}

function normalizeSize(size) {
  const numeric = Number.parseFloat(size)
  return Number.isFinite(numeric) ? numeric : null
}

export function clampDrawerWidth(size, options = {}) {
  const {
    minWidthRatio = DEFAULT_MIN_WIDTH_RATIO,
    maxWidthRatio = DEFAULT_MAX_WIDTH_RATIO,
    minWidth = DEFAULT_MIN_WIDTH,
    maxWidth = DEFAULT_MAX_WIDTH
  } = options

  const numericSize = normalizeSize(size)
  if (numericSize === null) {
    return null
  }

  const viewportWidth = getViewportWidth()
  const ratioMin = viewportWidth ? viewportWidth * minWidthRatio : minWidth
  const ratioMax = viewportWidth ? viewportWidth * maxWidthRatio : maxWidth
  const effectiveMin = Math.max(minWidth, ratioMin)
  const effectiveMax = Math.min(maxWidth, ratioMax)
  const clamped = Math.min(Math.max(numericSize, effectiveMin), effectiveMax)

  return Math.round(clamped)
}

export function getStoredDrawerWidth(options = {}) {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    defaultSize = DEFAULT_FALLBACK_SIZE,
    largeScreenDefaultSize = LARGE_SCREEN_FALLBACK_SIZE,
    largeScreenBreakpoint = LARGE_SCREEN_BREAKPOINT
  } = options

  if (typeof window === 'undefined') {
    return defaultSize
  }

  const storedWidth = clampDrawerWidth(localStorage.getItem(storageKey), options)
  if (storedWidth !== null) {
    return `${storedWidth}px`
  }

  return window.innerWidth >= largeScreenBreakpoint ? largeScreenDefaultSize : defaultSize
}

export function useDrawerResize(options = {}) {
  const { storageKey = DEFAULT_STORAGE_KEY } = options

  function persistDrawerWidth(size) {
    const nextWidth = clampDrawerWidth(size, options)
    if (nextWidth === null) {
      return getStoredDrawerWidth(options)
    }

    localStorage.setItem(storageKey, String(nextWidth))
    return `${nextWidth}px`
  }

  return {
    getStoredDrawerWidth: () => getStoredDrawerWidth(options),
    persistDrawerWidth
  }
}
