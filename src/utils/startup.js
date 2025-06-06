// import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router, { resetRouter } from '@/router'
import Vue from 'vue'
import { message } from '@/utils/message'
import orgUtil from '@/utils/org'
import orgs from '@/api/orgs'
import { getPropView, isViewHasOrgs } from '@/utils/jms'

const whiteList = ['/login', process.env.VUE_APP_LOGIN_PATH] // no redirect whitelist
const autoEnterOrgs = [
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000'
]

function reject(msg) {
  return new Promise((resolve, reject) => reject(msg))
}

async function beforeGoToLogin() {
  // remove currentOrg: System org item
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key.startsWith('currentOrg:')) {
      continue
    }
    let value = localStorage.getItem(key)
    value = JSON.parse(value)
    if (!value.is_system) {
      continue
    }
    localStorage.removeItem(key)
  }
  if (store.getters.currentOrg.autoEnter) {
    await store.dispatch('users/setCurrentOrg', store.getters.preOrg)
  }
}

async function checkLogin({ to, from, next }) {
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  }

  try {
    return await store.dispatch('users/getProfile')
  } catch (e) {
    Vue.$log.error(e)
    await beforeGoToLogin()
    return reject('No profile get: ' + e)
  }
}

async function getPublicSetting({ to, from, next }, isOpen) {
  // 获取Public settings
  const publicSettings = store.getters.publicSettings
  if (!publicSettings || Object.keys(publicSettings).length === 0 || !isOpen) {
    await store.dispatch('settings/getPublicSettings', isOpen)
  }
}

async function refreshCurrentOrg() {
  return orgs.getCurrentOrg().then(org => {
    // Root 就不刷新本地的了, 会影响 autoEnter
    if (autoEnterOrgs.indexOf(org.id) !== -1) {
      return
    }
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
  const globalOrgPath = [
    '/console/perms/login-acls/', '/console/users/roles/',
    '/console/perms/connect-method-acls/', '/settings/'
  ]
  if (autoEnterOrgs.indexOf(currentOrg.id) !== -1 && currentOrg.autoEnter) {
    const delta = new Date().getTime() - currentOrg.autoEnter
    const notNeedChange = globalOrgPath.find(path => to.path.indexOf(path) === 0)
    if (!notNeedChange && delta > 3000) {
      await orgUtil.change2PropOrg({ to, from, next })
    }
    return
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
    Vue.$log.debug('All routes:', accessRoutes.reduce((acc, cur) => {
      acc[cur.name] = cur
      return acc
    }, {}))
    router.addRoutes(accessRoutes)

    await store.dispatch('permission/generateViewRoutes', { to, from })

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    // Vue.$log.debug('Next to: ', to)
    next({ ...to, replace: true })
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    message.error(error || 'Has Error')
    Vue.$log.error('Error occur: ', error)
  }
}

export async function checkUserFirstLogin({ to, from, next }) {
  // 防止递归调用
  if (to.path === '/profile/improvement') return true
  if (store.state.users.profile.is_first_login) {
    next({
      name: 'Improvement',
      replace: true,
      query: { _t: Date.now() } // 添加时间戳，防止 from 一样 next 不触发 guard.js router.beforeEach逻辑
    })
  } else {
    const nextRoute = localStorage.getItem('next')
    if (nextRoute) {
      localStorage.setItem('next', '')
      next(nextRoute.replace('#', ''))
    }
  }
}

export async function changeCurrentViewIfNeed({ to, from, next }) {
  let viewName = to.path.split('/')[1]
  // 这几个是需要检测的, 切换视图组织时，避免 404, 这里不能加 settings, 因为 默认没有返回 setting 组织(System) 的管理权限
  if (['console', 'audit', 'workbench', 'tickets', 'pam', ''].indexOf(viewName) === -1) {
    Vue.$log.debug('Current view no need check', viewName)
    return
  }

  const has = isViewHasOrgs(viewName)
  Vue.$log.debug('Change has current view, has perm: ', viewName, '=>', has)
  if (has) {
    await store.dispatch('users/changeToView', viewName)
    return { status: 'continue' }
  }
  viewName = getPropView()
  // Next 之前要重置 init 状态，否则这些路由守卫就不走了
  await store.dispatch('app/reset')
  next(`/${viewName}/`)

  // new Promise((resolve, reject) => reject('')) 这种方式通过输出发现在页面除此渲染的时候执行两次，
  // 返回一个 Promise 我理解是为了中断第一次导航，确保只有第二次导航到到有权限的视图。由于第一个 has 为 false
  // 导致被 startup catch 捕获，而 error 的 trace 之所以锁定为到 runtime 等中也是因为由于 Babel 和 Polyfill 的缘故

  return { status: 'redirected', to: viewName }
}

function onI18nLoaded() {
  return new Promise(resolve => {
    const load = store.state.app.i18nLoaded
    if (load) {
      resolve()
    }
    const itv = setInterval(() => {
      const load = store.state.app.i18nLoaded
      if (load) {
        clearInterval(itv)
        resolve()
      }
    }, 100)
  })
}

export async function startup({ to, from, next }) {
  // if (store.getters.inited) { return true }
  if (store.getters.inited) {
    // 页面初始化后也需要检测
    await checkUserFirstLogin({ to, from, next })
    return true
  }

  try {
    await store.dispatch('app/init')

    // set page title
    // await getOpenPublicSetting({ to, from, next })
    await getPublicSetting({ to, from, next }, true)
    await checkLogin({ to, from, next })
    await onI18nLoaded()
    await getPublicSetting({ to, from, next }, false)
    const viewResult = await changeCurrentViewIfNeed({ to, from, next })
    if (viewResult && viewResult.status === 'redirected') return true
    await changeCurrentOrgIfNeed({ to, from, next })
    await generatePageRoutes({ to, from, next })
    await checkUserFirstLogin({ to, from, next })
    await store.dispatch('assets/getAssetCategories')
  } catch (e) {
    Vue.$log.error('Startup error: ', e)
  }
  return true
}

