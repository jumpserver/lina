import { hasUUID, BASE_URL } from '@/utils/common'
import store from '@/store'

function getPropOrg() {
  const userAdminOrgList = store.getters.userAdminOrgList
  let defaultOrg = userAdminOrgList.find((item) => item.id === '')
  if (defaultOrg) {
    return defaultOrg
  }
  defaultOrg = userAdminOrgList.find((item) => item.id === 'DEFAULT')
  if (defaultOrg) {
    return defaultOrg
  }
  return userAdminOrgList[0]
}

function change2PropOrg() {
  const org = getPropOrg()
  setTimeout(() => changeOrg(org.id), 100)
}

function getOrgIdMapper() {
  const mapper = {}
  const userAdminOrgList = store.getters.userAdminOrgList
  userAdminOrgList.forEach((v) => {
    mapper[v.id] = v
  })
  return mapper
}

function hasCurrentOrgPermission() {
  const currentOrg = store.getters.currentOrg
  const currentOrgId = currentOrg.id
  const userAdminOrgList = store.getters.userAdminOrgList
  const orgInList = userAdminOrgList.find((item) => item.id === currentOrgId)
  return orgInList
}

async function changeOrg(orgId) {
  const org = getOrgIdMapper()[orgId]
  if (!org) {
    console.debug('Error: org not found')
  } else {
    console.debug('Change to org: ', org)
  }
  // 重置Role为空
  await store.dispatch('users/setCurrentRole', null)

  store.dispatch('users/setCurrentOrg', org).then(() => {
    // console.log('Set current org to: ', org)
    if (hasUUID(location.href)) {
      location.href = BASE_URL
    } else {
      window.location.reload(true)
    }
  })
}

export default {
  hasCurrentOrgPermission,
  changeOrg,
  change2PropOrg
}
