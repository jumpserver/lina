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

async function changeOrg(org, reload = true) {
  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  let path = location.href
  if (hasUUID(path)) {
    path = replaceUUID(path, '')
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

async function fromPageChangeOrg(org, that) {
  const { path, name, matched } = that.$route
  await store.dispatch('users/setCurrentOrg', org)
  await store.dispatch('app/reset')
  if (name.indexOf('Detail') > -1 || name.indexOf('Update') > -1) {
    const currentRouteIndex = matched.findIndex(item => item.name === name)
    const parentRoute = matched[currentRouteIndex].parent
    that.$router.replace(parentRoute)
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
  fromPageChangeOrg,
  getPropOrg
}
