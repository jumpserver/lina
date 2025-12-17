export function resolveRoute(route, router) {
  const routes = router.resolve(route)
  if (!routes) {
    return
  }
  const matched = routes.resolved.matched.filter(
    item => item.name === route.name && item.components
  )
  if (matched.length === 0) {
    return
  }
  if (matched[0] && matched[0].components?.default) {
    return matched[0]
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
