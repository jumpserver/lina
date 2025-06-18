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
