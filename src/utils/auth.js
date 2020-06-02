import VueCookie from 'vue-cookie'

const TOKEN_KEY = 'csrftoken'
const CURRENT_ORG_KEY = 'currentOrg'
const CURRENT_ROLE_KEY = 'currentRole'

export function getTokenFromCookie() {
  return VueCookie.get(TOKEN_KEY)
}

export function getCurrentRole() {
  return VueCookie.get(CURRENT_ROLE_KEY)
}

export function setCurrentRole(token) {
  return VueCookie.set(CURRENT_ROLE_KEY, token, -1)
}

export function getCurrentOrgFromCookie() {
  let org = null
  try {
    org = JSON.parse(VueCookie.get(CURRENT_ORG_KEY))
  } finally {
    console.log('Current org in cookie: ', org)
  }
  return org
}

export function saveCurrentOrgToCookie(org) {
  console.log('Set to cookie: ', JSON.stringify(org))
  VueCookie.set(CURRENT_ORG_KEY, JSON.stringify(org), 100)
  console.log('Then get cookie: ', getCurrentOrgFromCookie())
}

export function removeCurrentOrg() {
  return VueCookie.remove(CURRENT_ORG_KEY)
}
