import { defineAsyncComponent, markRaw } from 'vue'
import store from '@/store'

const asyncComponentCache = new WeakMap()

export function resolveAsyncComponentCompat(component) {
  if (typeof component !== 'function') {
    return component
  }
  if (!asyncComponentCache.has(component)) {
    asyncComponentCache.set(component, markRaw(defineAsyncComponent(component)))
  }
  return asyncComponentCache.get(component)
}

export function resolveRoute(route, router) {
  try {
    const routes = router.resolve(route)
    if (!routes) {
      return
    }
    // Vue Router 4: router.resolve() 直接返回路由对象，没有 .resolved 属性
    // Vue Router 3: router.resolve() 返回 { resolved: {...}, ... }
    const resolved = routes.resolved || routes
    if (!resolved || !resolved.matched) {
      return
    }
    const matched = resolved.matched.filter((item) => item.name === route.name && item.components)
    if (matched.length === 0) {
      return
    }
    if (matched[0] && matched[0].components?.default) {
      return matched[0]
    }
  } catch (error) {
    // vue-router 5 throws when route name not found; silently return undefined
    return
  }
}

const vueListenerAttrRE = /^on[^a-z]/

export function isVueListenerAttrKey(key) {
  return vueListenerAttrRE.test(key)
}

export function toVueListenerName(attrKey) {
  if (!isVueListenerAttrKey(attrKey)) {
    return ''
  }

  const rawName = attrKey.slice(2)
  const separatorIndex = rawName.indexOf(':')

  if (separatorIndex === -1) {
    return rawName
      .replace(/([A-Z])/g, '-$1')
      .replace(/^-/, '')
      .toLowerCase()
  }

  const first = rawName.slice(0, separatorIndex)
  const rest = rawName.slice(separatorIndex + 1)

  return `${first
    .replace(/([A-Z])/g, '-$1')
    .replace(/^-/, '')
    .toLowerCase()}:${rest}`
}

export function pickVueListeners(attrs = {}) {
  return Object.entries(attrs).reduce((listeners, [key, value]) => {
    if (isVueListenerAttrKey(key)) {
      listeners[toVueListenerName(key)] = value
    }
    return listeners
  }, {})
}

export function omitVueListeners(attrs = {}) {
  return Object.entries(attrs).reduce((forwardedAttrs, [key, value]) => {
    if (!isVueListenerAttrKey(key)) {
      forwardedAttrs[key] = value
    }
    return forwardedAttrs
  }, {})
}

export function getComponentFromRoute(route, router) {
  const r = resolveRoute(route, router)
  if (!r) {
    return
  }
  return resolveAsyncComponentCompat(r.components.default)
}

export function getRouteUrl(route, router) {
  if (typeof route === 'string') {
    route = { name: route }
  }

  const r = router.resolve(route)

  if (!r) {
    return
  }
  return r.href || r.path
}

function normalizePath(path) {
  if (!path) {
    return '/'
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/+/g, '/')
}

function joinPath(basePath, childPath) {
  if (!childPath) {
    return normalizePath(basePath)
  }
  if (childPath.startsWith('/')) {
    return normalizePath(childPath)
  }
  const base = normalizePath(basePath).replace(/\/$/, '')
  return normalizePath(`${base}/${childPath}`)
}

function shouldSkipRoute(route) {
  if (!route) {
    return true
  }
  if (route.hidden) {
    return true
  }
  if (route.meta?.hidden === true) {
    return true
  }
  return false
}

function pickFirstAccessiblePath(route, parentPath, rootPath) {
  if (shouldSkipRoute(route)) {
    return ''
  }
  const routePath = route.meta?.fullPath || joinPath(parentPath, route.path || '')

  if (route.children?.length) {
    for (const child of route.children) {
      const childPath = pickFirstAccessiblePath(child, routePath, rootPath)
      if (childPath) {
        return childPath
      }
    }
  }

  if (
    routePath &&
    routePath !== rootPath &&
    !routePath.includes('/:') &&
    !routePath.endsWith('/:id')
  ) {
    return routePath
  }

  return ''
}

export function getFirstAccessibleChildPath(rootPath) {
  const normalizedRootPath = normalizePath(rootPath)
  const viewRoutes = store.getters?.viewRoutes || []
  const rootRoute = viewRoutes.find((route) => {
    const routePath = route?.meta?.fullPath || route?.path
    return normalizePath(routePath) === normalizedRootPath
  })

  if (!rootRoute?.children?.length) {
    return ''
  }

  for (const child of rootRoute.children) {
    const targetPath = pickFirstAccessiblePath(child, normalizedRootPath, normalizedRootPath)
    if (targetPath) {
      return targetPath
    }
  }
  return ''
}
