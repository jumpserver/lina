import { hasUUID, BASE_URL } from '@/utils/common'
import { getOrgDetail } from '@/api/orgs'
import store from '@/store'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'
// const ROOT_ORG_ID = '00000000-0000-0000-0000-000000000000'

function getPropOrg() {
  const userAdminOrgList = store.getters.userAdminOrgList
  const defaultOrg = userAdminOrgList.find((item) => item.id === DEFAULT_ORG_ID)
  if (defaultOrg) {
    return defaultOrg
  }
  return userAdminOrgList[0]
}

function change2PropOrg() {
  const org = getPropOrg()
  setTimeout(() => changeOrg(org.id), 100)
}

// function getOrgIdMapper() {
//   const mapper = {}
//   const userAdminOrgList = store.getters.userAdminOrgList
//   userAdminOrgList.forEach((v) => {
//     mapper[v.id] = v
//   })
//   return mapper
// }

function hasCurrentOrgPermission() {
  const currentOrg = store.getters.currentOrg
  const currentOrgId = currentOrg.id
  const userAdminOrgList = store.getters.userAdminOrgList
  const orgInList = userAdminOrgList.find((item) => item.id === currentOrgId)
  return orgInList
}

async function changeOrg(orgId) {
  const org = await getOrgDetail(orgId)
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
  DEFAULT_ORG_ID,
  change2PropOrg
}
