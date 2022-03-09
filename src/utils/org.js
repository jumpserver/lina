import { hasUUID, BASE_URL } from '@/utils/common'
import { getOrgDetail } from '@/api/orgs'
import store from '@/store'

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000002'
// const ROOT_ORG_ID = '00000000-0000-0000-0000-000000000000'

function getPropOrg() {
  const orgs = store.getters.orgs
  const defaultOrg = orgs.find((item) => item.is_default)
  if (defaultOrg) {
    return defaultOrg
  }
  return orgs[0]
}

function change2PropOrg() {
  const org = getPropOrg()
  setTimeout(() => changeOrg(org.id), 100)
}

function hasCurrentOrgPermission() {
  const currentOrg = store.getters.currentOrg
  const currentOrgId = currentOrg.id
  const orgs = store.getters.orgs
  return orgs.find((item) => item.id === currentOrgId)
}

async function changeOrg(orgId) {
  const org = await getOrgDetail(orgId)
  if (!org) {
    console.debug('Error: org not found')
  } else {
    console.debug('Change to org: ', org)
  }
  localStorage.setItem('PreView', '')

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
