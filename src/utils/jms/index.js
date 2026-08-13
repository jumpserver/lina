import { constantRoutes } from '@/router'
import store from '@/store'
import { getAssetUrlOr } from '@/utils/assets'
import { checkPermission, getResourceNameByPath, hasPermission } from './permission'

export { checkPermission, getResourceNameByPath, hasPermission } from './permission'

let taskWindowOffset = 0

function openTaskWindow(url, iWidth = 900, iHeight = 600) {
  const offset = taskWindowOffset * 30
  const maxTop = Math.max(0, window.screen.height - iHeight)
  const maxLeft = Math.max(0, window.screen.width - iWidth)
  const iTop = Math.min(maxTop, Math.max(0, (maxTop - 30) / 2 + offset))
  const iLeft = Math.min(maxLeft, Math.max(0, (maxLeft - 10) / 2 + offset))

  taskWindowOffset = (taskWindowOffset + 1) % 6

  window.open(
    url,
    '_blank',
    'height=' + iHeight + ',width=' + iWidth + ',top=' + iTop + ',left=' + iLeft
  )
}

export function openTaskPage(taskId, taskType, taskUrl) {
  taskType = taskType || 'celery'
  if (!taskUrl) {
    taskUrl = `/core/ops/${taskType}/task/${taskId}/log/?type=${taskType}`
  }
  openTaskWindow(taskUrl)
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

export function getPermedViews() {
  // 看不懂，别特么瞎改
  // 当用户访问某个 path 时，如果没有权限，应该 404，但是我们有个组织切换的功能，
  // 当用户从 A 组织切换到 B 组织时，如果切换到 B 组织没有权限，404 显然不够优雅。
  // 当用户访问某个 path 时，会从 path 提取 view，判断是否拥有权限，
  // 如果没有权限，则 自上而下，寻找第一个有权限的 view。
  // 这里应该拥有所有 view, 否则刷新页面时，有可能也会跳转
  const viewShowMapper = [
    ['console', store.getters.consoleOrgs.length > 0],
    ['audit', store.getters.auditOrgs.length > 0],
    ['pam', store.getters.pamOrgs.length > 0],
    ['workbench', true],
    ['tickets', hasPermission('tickets.view_ticket')],
    ['settings', hasPermission('settings.view_setting')]
  ]
  return viewShowMapper.filter((i) => i[1]).map((i) => i[0])
}

export function isSameView(to, from) {
  const fromView = from?.path.split('/')[1]
  const toView = to?.path.split('/')[1]
  return fromView === toView
}

export function getPropView() {
  const hasPermedViews = getPermedViews()
  const preView = localStorage.getItem('preView')
  const hasPerm = hasPermedViews.indexOf(preView) > -1
  if (hasPerm) {
    return preView
  }
  const preferView = getPermedViews()[0]
  if (preferView) {
    return preferView
  }
  return ''
}

export function getApiUrlRequirePerms(url, action) {
  const { app, resource } = getResourceFromApiUrl(url)
  return [`${app}.${action}_${resource}`]
}

export function isViewHasOrgs(viewName) {
  return getPermedViews().indexOf(viewName) > -1
}

export function getConstRouteName() {
  const names = []
  const constRoutes = constantRoutes
  const addRoutes = (all, routes) => {
    for (const route of routes) {
      names.push(route.name)
      if (route.children) {
        addRoutes(all, route.children)
      }
    }
  }
  addRoutes(names, constRoutes)
  return names
}

export function toM2MJsonParams(attrFilter) {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(attrFilter))
  return ['attr_rules', encodeURIComponent(btoa(String.fromCharCode(...data)))]
}

export function toM2MInstanceJsonParams(instanceAppModel, instanceId) {
  const encoder = new TextEncoder()
  const [app, model] = instanceAppModel.split('.')
  const data = encoder.encode(
    JSON.stringify({
      app,
      model,
      id: instanceId
    })
  )
  return ['attr_rules_instance', encodeURIComponent(btoa(String.fromCharCode(...data)))]
}

export function IsSupportPauseSessionType(terminalType) {
  const supportedType = ['koko', 'lion', 'chen', 'kael']
  return supportedType.includes(terminalType)
}

export function loadPlatformIcon(name, type) {
  const platformMap = {
    Huawei: 'huawei',
    Cisco: 'cisco',
    Gateway: 'gateway',
    macOS: 'macos',
    BSD: 'bsd',
    'Vmware-vSphere': 'vmware'
  }

  const value = platformMap[name] || type

  return getAssetUrlOr(`img/icons/${value}.png`, 'img/icons/other.png')
}
