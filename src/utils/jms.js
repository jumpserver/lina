import store from '@/store'

export function openTaskPage(taskId) {
  window.open(`/#/ops/celery/task/${taskId}/log/`, '', 'width=900,height=600')
}

export function hasPermission(permsRequired) {
  const perms = store.getters?.currentOrgPerms || []

  if (!permsRequired || permsRequired.length === 0) {
    return true
  }

  if (typeof permsRequired === 'string') {
    permsRequired = [permsRequired]
  }

  const has = perms.some(perm => {
    return permsRequired.includes(perm)
  })
  return has
}

export function getResourceNameByPath(path) {
  const pathSlice = path.split('/')
  const pathValue = pathSlice[pathSlice.length - 1]

  let resource = pathValue.replaceAll('-', '')
  if (resource[resource.length - 1] === 's') {
    resource = resource.slice(0, resource.length - 1)
  }
  return resource
}

export function getResourceFromRoute(route) {
  console.log('Route: ', route)
  const meta = route.meta || {}
  if (meta.app && meta.resource) {
    return { path: route.path, view: meta.view, app: meta.app, resource: meta.resource }
  }
  const p = route.path
  const re = new RegExp('/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)')
  const matched = p.match(re)
  if (!matched) {
    return { path: '', view: '', app: '', resource: '' }
  }
  const [path, view, app, resource] = matched
  const resourceCleaned = getResourceNameByPath(resource)
  const data = { path: path, view: view, app: app, resource: resourceCleaned }
  return data
}

export function getRouteRequiredPerms(route, action) {
  const { app, resource } = getResourceFromRoute(route)
  return [`${app}.${action}_${resource}`]
}

export function hasActionPerm(route, action) {
  const permsRequired = getRouteRequiredPerms(route, action)
  return hasPermission(permsRequired)
}
