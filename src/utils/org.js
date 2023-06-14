import store from '@/store'
import { hasUUID, replaceUUID } from '@/utils/common'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000002'
export const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000004'

export const GLOBAL_ORG_ID = '00000000-0000-0000-0000-000000000000'

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

async function changeOrg(org, reload = true, vm = null) {
  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  let path = location.hash.slice(1)
  if (hasUUID(path)) {
    path = replaceUUID(path, '')
  }
  if (vm) {
    const result = vm.$router.resolve({ path })
    if (result.resolved.name === '404') {
      path = '/'
    }
  }
  location.hash = '#' + path
  setTimeout(() => location.reload(), 400)
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
