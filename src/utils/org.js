import store from '@/store'
import { hasUUID, replaceUUID } from '@/utils/common'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000002'

function getPropOrg() {
  const orgs = store.getters.usingOrgs
  const defaultOrg = orgs.find((item) => item.is_default)
  if (defaultOrg) {
    return defaultOrg
  }
  return orgs.filter(item => !item['is_root'])[0]
}

async function change2PropOrg() {
  const org = getPropOrg()
  await changeOrg(org)
}

async function changeOrg(org) {
  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  let path = location.href
  if (hasUUID(path)) {
    path = replaceUUID(path, '')
    path = _.trimEnd(path, '/')
    location.href = path
  } else {
    location.reload()
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
  change2PropOrg,
  changeOrg,
  getPropOrg
}
