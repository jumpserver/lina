// import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router from '@/router'
import Vue from 'vue'
import { Message } from 'element-ui'
import 'nprogress/nprogress.css' // progress bar style
import { getTokenFromCookie } from '@/utils/auth'
import orgUtil from '@/utils/org'
import { getCurrentOrg } from '@/api/orgs'

const whiteList = ['/login', process.env.VUE_APP_LOGIN_PATH] // no redirect whitelist
let initial = false

function reject(msg) {
  return new Promise((resolve, reject) => reject(msg))
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
    Vue.$log.error(e)
    const status = e.response.status
    if (status === 401 || status === 403) {
      setTimeout(() => {
        window.location = process.env.VUE_APP_LOGIN_PATH
      }, 100)
    }
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

async function refreshCurrentOrg() {
  getCurrentOrg().then(org => {
    store.dispatch('users/setCurrentOrg', org)
  })
}

async function changeCurrentOrgIfNeed({ to, from, next }) {
  await store.dispatch('users/getInOrgs')
  const adminOrgs = store.getters.orgs
  if (!adminOrgs || adminOrgs.length === 0) {
    return
  }
  await refreshCurrentOrg()
  const currentOrg = store.getters.currentOrg
  if (!currentOrg || typeof currentOrg !== 'object') {
    orgUtil.change2PropOrg()
    return reject('Change prop org')
  }
  if (!orgUtil.hasCurrentOrgPermission()) {
    console.error('Not has current org permission')
    orgUtil.change2PropOrg()
    return reject('Change prop org')
  }
}

export async function generatePageRoutes({ to, from, next }) {
  // determine whether the user has obtained his permission roles through getProfile

  try {
    // try get user profile
    // generate accessible routes map based on roles
    let accessRoutes = await store.dispatch('permission/generateRoutes', { to, from })

    // Incorrect route, jump to 404
    accessRoutes = [...accessRoutes, {
      path: '*',
      redirect: '/404',
      hidden: true
    }]
    // dynamically add accessible routes
    Vue.$log.debug('All routes:', accessRoutes)
    router.addRoutes(accessRoutes)

    await store.dispatch('permission/generateViewRoutes', { to, from })

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    // Vue.$log.debug('Next to: ', to)
    next({ ...to, replace: true })
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    Message.error(error || 'Has Error')
    Vue.$log.error('Error occur: ', error)
  }
}

export async function checkUserFirstLogin({ to, from, next }) {
  if (store.state.users.profile.is_first_login) {
    next('/profile/improvement')
  }
}

export async function startup({ to, from, next }) {
  if (initial) {
    return true
  }
  initial = true

  // set page title
  await getPublicSetting({ to, from, next })
  // await setHeadTitle({ to, from, next })
  await checkLogin({ to, from, next })
  await generatePageRoutes({ to, from, next })
  await changeCurrentOrgIfNeed({ to, from, next })
  await checkUserFirstLogin({ to, from, next })
  return true
}

