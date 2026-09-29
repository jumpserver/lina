// Only serializable navigation state belongs in the URL. Rows, callbacks and
// component loaders stay in the drawer runtime.
export const DRAWER_QUERY_KEYS = ['drawer', 'drawerId', 'drawerTab', 'drawerQuery']

function scalar(value) {
  return typeof value === 'string' && value.length > 0 ? value : ''
}

export function withoutDrawerQuery(query = {}) {
  return Object.fromEntries(
    Object.entries(query).filter(([key]) => !DRAWER_QUERY_KEYS.includes(key))
  )
}

function detailQuery(query = {}) {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([key, value]) =>
        !DRAWER_QUERY_KEYS.includes(key) &&
        ![
          'tab',
          'oid',
          'id',
          'action',
          'isDrawer',
          'row',
          'col',
          'params',
          'query',
          'route',
          'routeName',
          'handlers',
          '__drawerToken'
        ].includes(key) &&
        (value === null ||
          typeof value === 'string' ||
          typeof value === 'number' ||
          (Array.isArray(value) &&
            value.every((item) => item === null || typeof item === 'string')))
    )
  )
}

export function resolveDrawerRoute(router, location) {
  try {
    if (!scalar(location?.name) || !scalar(String(location?.params?.id || ''))) return null
    const resolved = router.resolve(location)
    const record = resolved.matched.at(-1)
    // Use the registered, permission-filtered route table. Never import a
    // component path supplied in a URL or open create/update pages as details.
    if (
      !record?.components?.default ||
      record.redirect ||
      record.meta?.drawer === false ||
      record.name !== location.name ||
      !record.path.includes(':id') ||
      !String(record.name).endsWith('Detail')
    ) {
      return null
    }
    return { location: resolved, component: record.components.default }
  } catch {
    return null
  }
}

export function readDrawerRoute(router, route) {
  const query = route.query || {}
  if (!DRAWER_QUERY_KEYS.some((key) => key in query)) return null
  const name = scalar(query.drawer)
  const id = scalar(query.drawerId)
  let extra = {}
  try {
    if (query.drawerQuery !== undefined) {
      if (typeof query.drawerQuery !== 'string') return { invalid: true }
      const parsed = JSON.parse(query.drawerQuery)
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') return { invalid: true }
      extra = detailQuery(parsed)
    }
  } catch {
    return { invalid: true }
  }
  if (!name || !id || (query.drawerTab !== undefined && !scalar(query.drawerTab))) {
    return { invalid: true }
  }
  const resolved = resolveDrawerRoute(router, {
    name,
    params: { id },
    query: {
      ...extra,
      ...(query.drawerTab ? { tab: query.drawerTab } : {})
    }
  })
  return resolved || { invalid: true }
}

export function drawerRouteKey(route) {
  return JSON.stringify([
    route.path,
    route.query?.drawer,
    route.query?.drawerId,
    route.query?.drawerQuery || ''
  ])
}

export function closeDetailDrawer(router) {
  const current = router.currentRoute.value
  return router.replace({
    path: current.path,
    hash: current.hash,
    query: withoutDrawerQuery(current.query)
  })
}
