import store from '@/store'
import { getQueryFromPath } from '@/utils/common/index'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000002'
export const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000004'

export const GLOBAL_ORG_ID = '00000000-0000-0000-0000-000000000000'

function getPropOrg() {
  const orgs = store.getters.usingOrgs
  const preOrg = store.getters.preOrg || {}
  const preFound = orgs.find((item) => item.id === preOrg.id)
  if (preFound) {
    return preFound
  }
  const defaultOrg = orgs.find((item) => item.is_default)
  if (defaultOrg) {
    return defaultOrg
  }
  // 优先选择非 SYSTEM 和非 ROOT 的组织
  const nonSystemOrg = orgs.find((item) => !item['is_root'] && !item['is_system'])
  if (nonSystemOrg) {
    return nonSystemOrg
  }
  // 如果用户只有 SYSTEM 组织，则允许使用 SYSTEM 组织，避免登录无限重定向
  return orgs[0]
}

async function change2PropOrg() {
  const org = getPropOrg()
  await changeOrg(org)
}

async function changeOrg(org, reload = true, vm = null) {
  if (!org || typeof org !== 'object' || !org.id) {
    console.error('Invalid organization supplied to changeOrg:', org)
    return false
  }

  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  const fullPath = location.hash.slice(1)
  const query = getQueryFromPath(fullPath)

  const index = fullPath.indexOf('?')
  let path
  if (index !== -1) {
    path = fullPath.slice(0, index)
  } else {
    path = fullPath
  }
  // 替换 Path 中的 UUID
  const idRegex = /\/?([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})|(-?\d+(\.\d+)?)\/?/
  const i = path.search(idRegex)
  if (i !== -1) {
    path = path.slice(0, i + 1)
  }

  // 替换 Query 中的 UUID
  const newQuery = {}
  const ignoreOrgQueryKey = ['platform']
  for (const [key, value] of Object.entries(query)) {
    if (ignoreOrgQueryKey.includes(key)) {
      newQuery[key] = value
      continue
    }
    if (!value.match(idRegex)) {
      newQuery[key] = value
    }
  }
  const queryStr = Object.entries(newQuery)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  path = path + (queryStr ? '?' + queryStr : '')

  if (vm) {
    const resolvedRoute = vm.$router.resolve({ path })
    if (['404', 'NotFound'].includes(resolvedRoute?.name)) {
      path = '/'
    }
  }
  location.hash = '#' + path
  if (reload) {
    setTimeout(() => location.reload(), 500)
  }
  return true
}

function hasCurrentOrgPermission() {
  const currentOrg = store.getters.currentOrg
  const currentOrgId = currentOrg.id
  const orgs = store.getters.usingOrgs
  return orgs.find((item) => item.id === currentOrgId)
}

export default {
  hasCurrentOrgPermission,
  DEFAULT_ORG_ID,
  SYSTEM_ORG_ID,
  GLOBAL_ORG_ID,
  change2PropOrg,
  changeOrg,
  getPropOrg
}
