// import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router, { resetRouter } from '@/router'
import Vue from 'vue'
import { Message } from 'element-ui'
import 'nprogress/nprogress.css' // progress bar style
import { getTokenFromCookie } from '@/utils/auth'
import orgUtil from '@/utils/org'
import orgs from '@/api/orgs'
import { getPropView, isViewHasOrgs } from '@/utils/jms'
import request from '@/utils/request'

const whiteList = ['/login', process.env.VUE_APP_LOGIN_PATH] // no redirect whitelist

function reject(msg) {
  return new Promise((resolve, reject) => reject(msg))
}

async function checkLogin({ to, from, next }) {
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  }
  // Determine whether the user has logged in
  const hasToken = getTokenFromCookie()
  if (!hasToken || hasToken === 'null') {
    request.get(process.env['VUE_APP_LOGOUT_PATH']).finally(() => {
      window.location = process.env.VUE_APP_LOGIN_PATH
    })
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

function afterGetSetting(setting) {
  // if (setting['SESSION_EXPIRE_AT_BROWSER_CLOSE']) {
  //   setInterval(() => {
  //     const csrfToken = getTokenFromCookie()
  //     Vue.$log.debug('Refresh csrf token expiration: ', csrfToken)
  //     if (csrfToken) { setTokenToCookie(csrfToken, '30s') }
  //   }, 10 * 1000)
  // }
}

async function getPublicSetting({ to, from, next }, isOpen) {
  // 获取Public settings
  const publicSettings = store.getters.publicSettings
  if (!publicSettings || !isOpen) {
    await store.dispatch('settings/getPublicSettings', isOpen)
  }
  afterGetSetting(store.getters.publicSettings)
}

async function refreshCurrentOrg() {
  orgs.getCurrentOrg().then(org => {
    store.dispatch('users/setCurrentOrg', org)
  })
}

async function changeCurrentOrgIfNeed({ to, from, next }) {
  await store.dispatch('users/getProfile')

  const usingOrgs = store.getters.usingOrgs
  if (!usingOrgs || usingOrgs.length === 0) {
    Vue.$log.debug('No using orgs, return: ', usingOrgs)
    return
  }
  await refreshCurrentOrg()
  const currentOrg = store.getters.currentOrg
  if (!currentOrg || typeof currentOrg !== 'object') {
    Vue.$log.error('Current org is null or not a object: ', currentOrg)
    await orgUtil.change2PropOrg({ to, from, next })
  }
  if (!orgUtil.hasCurrentOrgPermission()) {
    Vue.$log.error('Not has current org permission: ', currentOrg)
    await orgUtil.change2PropOrg({ to, from, next })
  }
}

export async function generatePageRoutes({ to, from, next }) {
  // determine whether the user has obtained his permission roles through getProfile
  resetRouter()

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

export async function changeCurrentViewIfNeed({ to, from, next }) {
  let viewName = to.path.split('/')[1]
  // 这几个是需要检测的, 切换视图组织时，避免 404
  if (['console', 'audit', 'workbench', 'tickets', ''].indexOf(viewName) === -1) {
    Vue.$log.debug('Current view no need check', viewName)
    return
  }

  const has = isViewHasOrgs(viewName)
  Vue.$log.debug('Change has current view, has perm: ', viewName, '=>', has)
  if (has) {
    await store.dispatch('users/changeToView', viewName)
    return
  }
  viewName = getPropView()
  // Next 之前要重置 init 状态，否则这些路由守卫就不走了
  await store.dispatch('app/reset')
  next(`/${viewName}/`)
  return new Promise((resolve, reject) => reject(''))
}

export async function startup({ to, from, next }) {
  // if (store.getters.inited) { return true }
  if (store.getters.inited) { return true }
  await store.dispatch('app/init')

  // set page title
  // await getOpenPublicSetting({ to, from, next })
  await getPublicSetting({ to, from, next }, true)
  await checkLogin({ to, from, next })
  await getPublicSetting({ to, from, next }, false)
  await changeCurrentViewIfNeed({ to, from, next })
  await changeCurrentOrgIfNeed({ to, from, next })
  await generatePageRoutes({ to, from, next })
  await checkUserFirstLogin({ to, from, next })
  return true
}

