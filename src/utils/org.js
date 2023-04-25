import store from '@/store'
import { hasUUID, replaceUUID } from '@/utils/common'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000002'
export const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000004'

function getPropOrg() {
  const orgs = store.getters.usingOrgs
  const defaultOrg = orgs.find((item) => item.is_default)
  if (defaultOrg) {
    return defaultOrg
  }
  return orgs.filter(item => !item['is_root'] && item.id !== SYSTEM_ORG_ID)[0]
}

async function change2PropOrg() {
  const org = getPropOrg()
  await changeOrg(org)
}

// 需要特殊处理资产相关页面在更新里切换组织
function needSpecialChangeAssetPath(path) {
  const url = path.split('#')[1]
  if (path.indexOf('/console/assets/cloud') > -1) {
    // 以 /XX/ 结尾替换成空字符串
    return url.replace(/\/[\w-]+\/$/, '')
  }
  if (path.indexOf('/console/assets') > -1) {
    return url.replace(/\/[\w-]+\/$/, '/assets')
  }
  return path
}

async function changeOrg(org, reload = true) {
  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  let path = location.href
  if (hasUUID(path)) {
    path = replaceUUID(path, '')
    path = needSpecialChangeAssetPath(path)
    path = _.trimEnd(path, '/')
    location.href = path
  } else {
    const index = path.indexOf('?')
    if (index !== -1) {
      location.href = path.substring(0, index)
    }
    setTimeout(() => location.reload(), 400)
  }
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
  change2PropOrg,
  changeOrg,
  getPropOrg
}
