// Generate the conventional CRUD routes while keeping each view's component
// and optional route metadata explicit. Non-standard paths stay handwritten.
export function createViewSetRoutes({
  name,
  list,
  form,
  create = form,
  update = form,
  detail,
  hidden = {},
  meta = {}
}) {
  const actions = [
    { action: 'list', path: '', component: list },
    { action: 'create', path: 'create', component: create },
    { action: 'update', path: ':id/update', component: update },
    { action: 'detail', path: ':id', component: detail }
  ]

  return actions
    .filter(({ component }) => component)
    .map(({ action, path, component }) => {
      const suffix = action[0].toUpperCase() + action.slice(1)
      const routeName = `${name}${suffix}`
      return {
        path,
        name: routeName,
        component,
        ...((hidden[action] ?? action !== 'list') ? { hidden: true } : {}),
        meta: {
          title: routeName,
          action: action === 'detail' ? 'retrieve' : action,
          ...meta.shared,
          ...meta[action]
        }
      }
    })
}
