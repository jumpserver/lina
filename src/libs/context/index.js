import { DRAWER_RUNTIME_CONTEXT } from '@/components/Drawer/context'

const DEFAULT_ROUTE_KEY = 'default'

function isRouteChanged(to, from) {
  return to?.name !== from?.name || to?.path !== from?.path
}

function getRouteScopeKey(route) {
  return route?.name || route?.path || DEFAULT_ROUTE_KEY
}

function getComponentInstance(vm) {
  return vm?.$ || null
}

function getProvidedScope(vm, provideKey) {
  let instance = getComponentInstance(vm)
  while (instance) {
    const provides = instance.provides
    if (provides && Object.prototype.hasOwnProperty.call(provides, provideKey)) {
      return provides[provideKey] || null
    }
    instance = instance.parent
  }
  return null
}

function deleteKeys(target, keys = []) {
  keys.forEach((key) => {
    Reflect.deleteProperty(target, key)
  })
}

function createContextService({ router } = {}) {
  const globalScope = {}
  const viewScopes = new Map()
  const routeScopes = new Map()

  function ensureViewScope(vm) {
    const uid = getComponentInstance(vm)?.uid
    if (!uid) {
      return {}
    }
    if (!viewScopes.has(uid)) {
      viewScopes.set(uid, {})
    }
    return viewScopes.get(uid)
  }

  function getViewScope(vm) {
    const uid = getComponentInstance(vm)?.uid
    if (!uid) {
      return {}
    }
    return viewScopes.get(uid) || ensureViewScope(vm)
  }

  function deleteViewScope(vm) {
    const uid = getComponentInstance(vm)?.uid
    if (uid) {
      viewScopes.delete(uid)
    }
  }

  function ensureRouteScope(route) {
    const routeKey = getRouteScopeKey(route)
    if (!routeScopes.has(routeKey)) {
      routeScopes.set(routeKey, {})
    }
    return routeScopes.get(routeKey)
  }

  function getRouteScope(vm) {
    const route = vm?.$route || router?.currentRoute?.value || router?.currentRoute || {}
    return ensureRouteScope(route)
  }

  function getOverlayScope(vm) {
    return getProvidedScope(vm, DRAWER_RUNTIME_CONTEXT) || null
  }

  function getRouteSnapshot(vm) {
    const route = vm?.$route || router?.currentRoute?.value || router?.currentRoute || {}
    return {
      ...route.meta,
      ...route.query,
      ...route.params,
      ...getRouteScope(vm)
    }
  }

  function resolveReadableScopes(vm, scope) {
    if (scope) {
      return [scope]
    }
    return ['overlay', 'view', 'route', 'global']
  }

  function getScopeStore(vm, scope) {
    switch (scope) {
      case 'overlay':
        return getOverlayScope(vm)
      case 'view':
        return getViewScope(vm)
      case 'route':
        return getRouteScope(vm)
      case 'global':
        return globalScope
      default:
        return null
    }
  }

  function getScopeSnapshot(vm, scope) {
    if (scope === 'route') {
      return getRouteSnapshot(vm)
    }
    if (scope === 'overlay') {
      // Drawer runtime keeps create/update args under query/params; flatten so
      // $context.get('platform'|'node'|...) works without nesting.
      const store = getOverlayScope(vm)
      if (!store) {
        return {}
      }
      return {
        ...store,
        ...(store.params || {}),
        ...(store.query || {})
      }
    }
    return { ...(getScopeStore(vm, scope) || {}) }
  }

  function resolveWritableScope(vm, scope) {
    if (scope) {
      return scope
    }
    return getOverlayScope(vm) ? 'overlay' : 'view'
  }

  function getValue(vm, key, options = {}) {
    for (const scope of resolveReadableScopes(vm, options.scope)) {
      const snapshot = getScopeSnapshot(vm, scope)
      if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
        return snapshot[key]
      }
    }
    return options.defaultValue
  }

  function setValue(vm, key, value, options = {}) {
    const scope = resolveWritableScope(vm, options.scope)
    const store = getScopeStore(vm, scope)
    if (!store) {
      return value
    }
    store[key] = value
    return value
  }

  function mergeValue(vm, values = {}, options = {}) {
    const scope = resolveWritableScope(vm, options.scope)
    const store = getScopeStore(vm, scope)
    if (!store) {
      return {}
    }
    Object.assign(store, values)
    return store
  }

  function hasValue(vm, key, options = {}) {
    return resolveReadableScopes(vm, options.scope).some((scope) => {
      const snapshot = getScopeSnapshot(vm, scope)
      return Object.prototype.hasOwnProperty.call(snapshot, key)
    })
  }

  function removeValue(vm, key, options = {}) {
    const scope = resolveWritableScope(vm, options.scope)
    const store = getScopeStore(vm, scope)
    if (store) {
      Reflect.deleteProperty(store, key)
    }
  }

  function clearScope(vm, options = {}) {
    const scope = resolveWritableScope(vm, options.scope)
    const store = getScopeStore(vm, scope)
    if (!store) {
      return
    }
    deleteKeys(store, Object.keys(store))
  }

  function createFacade(vm) {
    return {
      get(key, options = {}) {
        return getValue(vm, key, options)
      },
      set(key, value, options = {}) {
        return setValue(vm, key, value, options)
      },
      merge(values, options = {}) {
        return mergeValue(vm, values, options)
      },
      has(key, options = {}) {
        return hasValue(vm, key, options)
      },
      remove(key, options = {}) {
        return removeValue(vm, key, options)
      },
      clear(options = {}) {
        return clearScope(vm, options)
      },
      getScope(scope) {
        return getScopeSnapshot(vm, scope)
      }
    }
  }

  if (router?.afterEach) {
    router.afterEach((to, from) => {
      if (isRouteChanged(to, from)) {
        routeScopes.delete(getRouteScopeKey(from))
      }
    })
  }

  return {
    install(app) {
      app.mixin({
        unmounted() {
          deleteViewScope(this)
        }
      })

      Object.defineProperty(app.config.globalProperties, '$context', {
        get() {
          return createFacade(this)
        }
      })
    }
  }
}

export default createContextService
