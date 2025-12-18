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
    const matched = resolved.matched.filter(
      item => item.name === route.name && item.components
    )
    if (matched.length === 0) {
      return
    }
    if (matched[0] && matched[0].components?.default) {
      return matched[0]
    }
  } catch (error) {
    console.warn('resolveRoute error:', error, route)
    return
  }
}

export function getComponentFromRoute(route, router) {
  const r = resolveRoute(route, router)
  if (!r) {
    return
  }
  return r.components.default
}

export function getRouteUrl(route, router) {
  if (typeof route === 'string') {
    route = { name: route }
  }

  const r = router.resolve(route)

  if (!r) {
    return
  }
  return r.path || r.href
}
