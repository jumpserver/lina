import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import 'nprogress/nprogress.css' // progress bar style
import { getPermission, getToken, setPermission } from '@/utils/auth'

const whiteList = ['/login'] // no redirect whitelist
let initial = false

function setHeadTitle({ to, from, next }) {
  document.title = getPageTitle(to.meta.title)
}

function checkLogin({ to, from, next }) {
  // determine whether the user has logged in
  const hasToken = getToken()
  if (!hasToken) {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(process.env.LOGIN_PATH)
      return
    }
  }

  if (to.path === '/login') {
    // if is logged in, redirect to the home page
    next({ path: '/' })
    return
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
  const currentUser = store.getters.currentUser
  const hasRoles = currentUser && currentUser.current_org_roles && currentUser.current_org_roles.length > 0
  if (hasRoles) {
    next()
    return
  }
  try {
    // try get user profile
    // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
    // 不能改名 current_org_roles, 里面返回的就是这个
    let { current_org_roles } = await store.dispatch('users/getProfile')
    console.log('Current org role: ', current_org_roles)

    current_org_roles = checkRoles(current_org_roles)
    console.log('Current org role: ', current_org_roles)

    // generate accessible routes map based on roles
    const accessRoutes = await store.dispatch('permission/generateRoutes', current_org_roles)
    console.log('Access routes: ', accessRoutes)

    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    console.log('Next to: ', to)
    next({ ...to, replace: true })
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    Message.error(error || 'Has Error')
    console.log('Error occur: ', error)
    next(`/core/auth/login/`)
    // next()
  }
}

export async function startup({ to, from, next }) {
  if (initial) {
    console.debug('Has initial')
    return true
  }
  initial = true

  // set page title
  setHeadTitle({ to, from, next })
  console.log('Set head title')
  checkLogin({ to, from, next })
  console.log('Check login')
  await getPublicSetting({ to, from, next })
  console.log('Get public setting')
  await getUserRoleAndSetRoutes({ to, from, next })
  console.log('Get profile')
  return true
}

function checkRoles(val) {
  let currentRoles = getPermission()
  if (currentRoles) {
    if (val && !val.includes(currentRoles)) {
      // TODO 异常注入处理
      currentRoles = val[0]
      setPermission(currentRoles)
    }
  } else {
    // 设置默认路由
    currentRoles = val[0]
    setPermission(currentRoles)
  }
  return [currentRoles]
}

