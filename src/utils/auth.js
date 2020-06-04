import VueCookie from 'vue-cookie'

const TOKEN_KEY = 'csrftoken'
const CURRENT_ORG_KEY = 'jms_current_org'
const CURRENT_ROLE_KEY = 'jms_current_role'

export function getTokenFromCookie() {
  return VueCookie.get(TOKEN_KEY)
}

export function getCurrentRoleFromCookie() {
  const role = VueCookie.get(CURRENT_ROLE_KEY)
  if (role) {
    return parseInt(role) || null
  }
  return role
}

export function saveCurrentRoleToCookie(role) {
  console.log('Save current role to cookie: ', role)
  return VueCookie.set(CURRENT_ROLE_KEY, role, 14)
}

export function getCurrentOrgFromCookie() {
  let org = null
  try {
    org = JSON.parse(VueCookie.get(CURRENT_ORG_KEY))
  } catch (e) {
    console.log('Current org in cookie: ', org)
  }
  return org
}

export function saveCurrentOrgToCookie(org) {
  VueCookie.set(CURRENT_ORG_KEY, JSON.stringify(org), 14)
}

export function removeCurrentOrg() {
  return VueCookie.remove(CURRENT_ORG_KEY)
}
