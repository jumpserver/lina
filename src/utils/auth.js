import Cookies from 'js-cookie'

const TokenKey = 'csrftoken'
const CurrentOrg = 'currentorg'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
export function getCurrentOrg() {
  if (!Cookies.getJSON(CurrentOrg)) {
    setCurrentOrg({ id: '', name: 'DEFAULT' })
  }
  return Cookies.getJSON(CurrentOrg)
}

export function setCurrentOrg(token) {
  Cookies.set(CurrentOrg, token)
  // 切换组织后重新刷新页面
  window.location.reload(true)
}

export function removeCurrentOrg() {
  return Cookies.remove(CurrentOrg)
}
