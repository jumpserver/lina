import Cookies from 'js-cookie'

const TokenKey = 'csrftoken'
const CurrentOrg = 'currentOrg'
const Permission = 'currentRole'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getPermission() {
  return Cookies.get(Permission)
}

export function setPermission(token) {
  return Cookies.set(Permission, token)
}

export function removePermission() {
  return Cookies.remove(Permission)
}

export function getCurrentOrg() {
  let org = Cookies.getJSON(CurrentOrg)
  if (!org) {
    org = { id: '', name: 'DEFAULT' }
    setCurrentOrg(org)
    return org
  }
  return org
}

export function setCurrentOrg(org) {
  Cookies.set(CurrentOrg, org)
  // 切换组织后重新刷新页面
  window.location.reload(true)
}

export function removeCurrentOrg() {
  return Cookies.remove(CurrentOrg)
}
