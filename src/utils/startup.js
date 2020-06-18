import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import 'nprogress/nprogress.css' // progress bar style
import { getTokenFromCookie } from '@/utils/auth'
import rolec from '@/utils/role'
import orgUtil from '@/utils/org'

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
    }, 100)
    return reject('No token found in cookie')
  }

  try {
    return await store.dispatch('users/getProfile')
  } catch (e) {
    setTimeout(() => {
      window.location = process.env.VUE_APP_LOGIN_PATH
    }, 100)
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

async function changeCurrentOrgIfNeed({ to, from, next }) {
  await store.dispatch('users/getInOrgs')
  const adminOrgs = store.getters.userAdminOrgList
  if (!adminOrgs || adminOrgs.length === 0) {
    return
  }
  const currentOrg = store.getters.currentOrg
  if (!currentOrg || typeof currentOrg !== 'object') {
    console.log('Not has current org')
    orgUtil.change2PropOrg()
    return reject('change prop org')
  }
  if (!orgUtil.hasCurrentOrgPermission()) {
    console.debug('Not has current org permission')
    orgUtil.change2PropOrg()
    return reject('change prop org')
  }
}

async function changeCurrentRoleIfNeed({ to, from, next }) {
  await store.dispatch('users/getRoles')
  const userPerms = store.getters.currentOrgPerms

  let currentRole = store.getters.currentRole
  // 如果设置了当前角色，并且有这个权限的话
  if (currentRole && rolec.hasPerm(userPerms, currentRole)) {
    return
  }

  const adminOrgs = store.getters.userAdminOrgList
  if (!adminOrgs || adminOrgs.length === 0) {
    currentRole = rolec.USER_PAGE_REQUIRE_PERM_MIN
    await store.dispatch('users/setCurrentRole', currentRole)
    return
  }
  if (rolec.hasAdminPagePerm(userPerms)) {
    currentRole = rolec.getUserInAdminPagePerm(userPerms)
  } else {
    currentRole = rolec.getUserInUserPagePerm(userPerms)
  }
  await store.dispatch('users/setCurrentRole', currentRole)
}

export async function generatePageRoutes({ to, from, next }) {
  // determine whether the user has obtained his permission roles through getProfile

  try {
    // try get user profile
    // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
    // 不能改名 current_org_roles, 里面返回的就是这个
    const currentRole = store.getters.currentRole
    // console.log('Current org role: ', currentRole, rolec.getRolesDisplay(currentRole))

    // generate accessible routes map based on roles
    const accessRoutes = await store.dispatch('permission/generateRoutes', currentRole)

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

export async function checkUserFirstLogin({ to, from, next }) {
  if (store.state.users.profile.is_first_login) {
    next('/users/first-login/personal-information-improvement/')
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
  await changeCurrentOrgIfNeed({ to, from, next })
  await changeCurrentRoleIfNeed({ to, from, next })
  await getPublicSetting({ to, from, next })
  await generatePageRoutes({ to, from, next })
  await checkUserFirstLogin({ to, from, next })
  return true
}

