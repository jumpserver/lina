import store from '@/store'

export function openTaskPage(taskId) {
  window.open(`/#/ops/celery/task/${taskId}/log/`, '', 'width=900,height=600')
}

export function checkPermission(permsRequired, permsAll) {
  if (!permsRequired || permsRequired.length === 0) {
    return true
  }
  if (typeof permsRequired === 'string') {
    permsRequired = [permsRequired]
  }
  return permsRequired.every(perm => {
    // 包含 | 是或的关系, 单独处理
    if (perm.indexOf('|') === -1) {
      return permsAll.includes(perm)
    }
    const permOr = perm.split('|').map(item => item.trim())
    return permOr.some(perm => {
      return permsAll.includes(perm)
    })
  })
}

export function hasPermission(permsRequired) {
  const permsAll = store.getters?.currentOrgPerms || []
  return checkPermission(permsRequired, permsAll)
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

export function getResourceFromApiUrl(apiUrl) {
  const re = new RegExp('/api/v1/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)/.*')
  const matched = apiUrl.match(re)
  if (!matched) {
    return { path: '', app: '', resource: '' }
  }
  const [path, app, resource] = matched
  const resourceCleaned = getResourceNameByPath(resource)
  const data = { path: path, app: app, resource: resourceCleaned }
  return data
}

export function getResourceFromRoute(route) {
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

export function getBeforeViewRoute(routes) {
  const prefer = JSON.parse(localStorage.getItem('BeforeViewRouter')) || ''
  routes.forEach((i) => {
    if (i.name === 'Home') {
      if (i.path === prefer && i.path !== '') {
        i.redirect = prefer
      } else {
        i.redirect = routes.length >= 1 ? routes[1].path : '/404'
      }
    }
  })
  if (!prefer) {
    localStorage.setItem('BeforeViewRouter', JSON.stringify(prefer))
  }
  return routes
}

export function getApiUrlRequirePerms(url, action) {
  const { app, resource } = getResourceFromApiUrl(url)
  return [`${app}.${action}_${resource}`]
}
