function trimTrailingSlash(path) {
  return path?.replace(/\/+$/, '') || '/'
}

export function getRouteCacheKey(route) {
  const query = {}
  for (const [key, value] of Object.entries(route.query || {})) {
    if (key === 'tab' || key.includes('updated') || key.includes('order') || key.startsWith('_')) {
      continue
    }
    query[key] = value
  }

  if (route.query?.['_']) {
    return route.query['_']
  }
  if (route.path?.startsWith('/audit/reports/')) {
    return trimTrailingSlash(route.path)
  }

  const routeName = route.name?.toLowerCase?.() || ''
  const queryString = new URLSearchParams(query).toString()
  let key = trimTrailingSlash(route.path)
  if (routeName.includes('list')) {
    return `${key}?${queryString}`
  }
  if (queryString) {
    key += `?${queryString}`
  }
  return key
}

export function isRouteShellComponent(component) {
  const definition = component?.type || component
  if (!definition) {
    return false
  }
  if (definition.routeViewShell === true) {
    return true
  }
  if (definition.extends && isRouteShellComponent(definition.extends)) {
    return true
  }
  return (definition.mixins || []).some((mixin) => isRouteShellComponent(mixin))
}
