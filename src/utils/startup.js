import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import 'nprogress/nprogress.css' // progress bar style
import { getTokenFromCookie } from '@/utils/auth'

const whiteList = ['/login', process.env.VUE_APP_LOGIN_PATH] // no redirect whitelist
let initial = false

function reject(msg) {
  return new Promise((resolve, reject) => reject(msg))
}

function setHeadTitle({ to, from, next }) {
  document.title = getPageTitle(to.meta.title)
}

async function checkLogin({ to, from, next }) {
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  }
  // determine whether the user has logged in
  const hasToken = getTokenFromCookie()
  if (!hasToken) {
    setTimeout(() => {
      window.location = process.env.VUE_APP_LOGIN_PATH
    }, 1000)
    return reject('No token found in cookie')
  }

  try {
    return await store.dispatch('users/getProfile')
  } catch (e) {
    // return false
    // window.location = process.env.VUE_APP_LOGIN_PATH
    return reject('No profile get: ' + e)
  }
}

async function getPublicSetting({ to, from, next }) {
  // 获取Public settings
  const publicSettings = store.getters.publicSettings
  if (!publicSettings) {
    await store.dispatch('settings/getPublicSettings')
  }
}

export async function getUserRoleAndSetRoutes({ to, from, next }) {
  // determine whether the user has obtained his permission roles through getProfile

  try {
    // try get user profile
    // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
    // 不能改名 current_org_roles, 里面返回的就是这个
    const { current_org_roles } = await store.dispatch('users/getProfile')
    // console.log('Current org role: ', current_org_roles)

    const cleanedRoles = cleanCurrentRole(current_org_roles)
    console.log('Current org role: ', cleanedRoles)

    // generate accessible routes map based on roles
    const accessRoutes = await store.dispatch('permission/generateRoutes', cleanedRoles)

    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    // console.log('Next to: ', to)
    next({ ...to, replace: true })
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    Message.error(error || 'Has Error')
    console.log('Error occur: ', error)
  }
}

export async function startup({ to, from, next }) {
  if (initial) {
    return true
  }
  initial = true

  // set page title
  await setHeadTitle({ to, from, next })
  await checkLogin({ to, from, next })
  await getPublicSetting({ to, from, next })
  await getUserRoleAndSetRoutes({ to, from, next })
  return true
}

function cleanCurrentRole(val) {
  let currentRole = store.getters.currentRole
  if (!currentRole) {
    currentRole = val[0]
  }
  if (val && !val.includes(currentRole)) {
    // TODO 异常注入处理
    currentRole = val[0]
  }
  store.dispatch('users/setCurrentRole', currentRole)
  return [currentRole]
}

