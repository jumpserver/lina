// import getPageTitle from '@/utils/get-page-title'
import store from '@/store'
import router, { resetRouter } from '@/router'
import { message } from '@/utils/vue/message'
import orgUtil from '@/utils/jms/org'
import orgs from '@/api/orgs'
import { getPropView, isViewHasOrgs } from '@/utils/jms/index'
import { LOGIN_PATH } from '@/utils/env'

const whiteList = ['/login', LOGIN_PATH] // no redirect whitelist
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

async function checkLogin({ to, from }) {
  if (whiteList.indexOf(to.path) !== -1) {
    return true
  }

  try {
    return await store.dispatch('users/getProfile')
  } catch (e) {
    console.error(e)
    await beforeGoToLogin()
    return reject('No profile get: ' + e)
  }
}

async function getPublicSetting({ to, from }, isOpen) {
  // 获取Public settings
  const publicSettings = store.getters.publicSettings
  if (!publicSettings || Object.keys(publicSettings).length === 0 || !isOpen) {
    await store.dispatch('settings/getPublicSettings', isOpen)
  }
}

async function refreshCurrentOrg() {
  return orgs.getCurrentOrg().then((org) => {
    // Root 就不刷新本地的了, 会影响 autoEnter
    if (autoEnterOrgs.indexOf(org.id) !== -1) {
      return
    }
    store.dispatch('users/setCurrentOrg', org)
  })
}

async function changeCurrentOrgIfNeed({ to, from }) {
  await store.dispatch('users/getProfile')

  const usingOrgs = store.getters.usingOrgs
  if (!usingOrgs || usingOrgs.length === 0) {
    console.debug('No using orgs, return: ', usingOrgs)
    return
  }
  await refreshCurrentOrg()
  const currentOrg = store.getters.currentOrg
  if (!currentOrg || typeof currentOrg !== 'object') {
    console.error('Current org is null or not a object: ', currentOrg)
    await orgUtil.change2PropOrg()
  }
  const globalOrgPath = [
    '/console/perms/acls/login-acls',
    '/console/users/roles',
    '/console/perms/acls/connect-method-acls',
    '/settings'
  ]
  if (autoEnterOrgs.indexOf(currentOrg.id) !== -1 && currentOrg.autoEnter) {
    const delta = new Date().getTime() - currentOrg.autoEnter
    const notNeedChange = globalOrgPath.find((path) => to.path.indexOf(path) === 0)
    if (!notNeedChange && delta > 3000) {
      await orgUtil.change2PropOrg()
    }
    return
  }
  if (!orgUtil.hasCurrentOrgPermission()) {
    console.error('Not has current org permission: ', currentOrg)
    await orgUtil.change2PropOrg()
  }
}

export async function generatePageRoutes({ to, from }) {
  // determine whether the user has obtained his permission roles through getProfile
  resetRouter()

  try {
    // try get user profile
    // generate accessible routes map based on roles
    let accessRoutes = await store.dispatch('permission/generateRoutes', { to, from })

    // Incorrect route, jump to 404
    accessRoutes = [
      ...accessRoutes,
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/404'),
        hidden: true
      }
    ]
    // dynamically add accessible routes
    console.debug(
      'All routes:',
      accessRoutes.reduce((acc, cur) => {
        acc[cur.name] = cur
        return acc
      }, {})
    )
    // vue-router 5 不允许父子路由同名,递归去重:如果父 name 和某个后代重名,去掉父的 name
    function deduplicateRouteNames(routes, ancestorNames = new Set()) {
      for (const route of routes) {
        if (route.name && ancestorNames.has(route.name)) {
          // 子路由 name 与祖先重名,去掉子的(保留祖先的,子用 path 匹配)
          delete route.name
        }
        if (route.children && route.children.length > 0) {
          const childNames = new Set()
          for (const child of route.children) {
            if (child.name) childNames.add(child.name)
          }
          // 如果父 name 和某个 child name 相同,去掉父的 name(父只是容器)
          if (route.name && childNames.has(route.name)) {
            delete route.name
          }
          const newAncestors = new Set(ancestorNames)
          if (route.name) newAncestors.add(route.name)
          deduplicateRouteNames(route.children, newAncestors)
        }
      }
    }
    deduplicateRouteNames(accessRoutes)

    accessRoutes.forEach((route) => {
      try {
        router.addRoute(route)
      } catch (e) {
        console.warn('addRoute failed:', route.name || route.path, e.message)
      }
    })

    await store.dispatch('permission/generateViewRoutes', { to, from })

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    // console.debug('Next to: ', to)
    return { path: to.path, query: to.query, hash: to.hash, replace: true }
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    message.error(error || 'Has Error')
    console.error('Error occur: ', error)
  }
}

export async function checkUserFirstLogin({ to, from, next }) {
  // 防止递归调用
  if (to.path === '/profile/improvement') return true
  if (store.state.users.profile.is_first_login) {
    return {
      name: 'Improvement',
      replace: true,
      query: { _t: Date.now() } // 添加时间戳，防止 from 一样 next 不触发 guard.js router.beforeEach逻辑
    }
  } else {
    const nextRoute = localStorage.getItem('next')
    if (nextRoute) {
      localStorage.setItem('next', '')
      return nextRoute.replace('#', '')
    }
  }
  return true
}

export async function changeCurrentViewIfNeed({ to, from }) {
  let viewName = to.path.split('/')[1]
  // 这几个是需要检测的, 切换视图组织时，避免 404, 这里不能加 settings, 因为 默认没有返回 setting 组织(System) 的管理权限
  if (['console', 'audit', 'pam', 'workbench', 'tickets', ''].indexOf(viewName) === -1) {
    console.debug('Current view no need check', viewName)
    return
  }

  const has = isViewHasOrgs(viewName)
  console.debug('Change has current view, has perm: ', viewName, '=>', has)
  if (has) {
    await store.dispatch('users/changeToView', viewName)
    return true
  }
  const preferView = getPropView()
  // 如果没有可用视图，直接放行，避免无限重定向
  if (!preferView || preferView === viewName) {
    return true
  }
  viewName = preferView
  // Next 之前要重置 init 状态，否则这些路由守卫就不走了
  await store.dispatch('app/reset')
  return `/${viewName}`
}

function onI18nLoaded() {
  return new Promise((resolve) => {
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
    const firstLoginResult = await checkUserFirstLogin({ to, from })
    if (firstLoginResult && firstLoginResult !== true) {
      return firstLoginResult
    }
    return true
  }

  try {
    await store.dispatch('app/init')

    // set page title
    // await getOpenPublicSetting({ to, from, next })
    await getPublicSetting({ to, from }, true)
    await checkLogin({ to, from })
    await onI18nLoaded()
    await getPublicSetting({ to, from }, false)
    const viewResult = await changeCurrentViewIfNeed({ to, from })
    if (viewResult && viewResult !== true) return viewResult
    await changeCurrentOrgIfNeed({ to, from })
    const pageRoutesResult = await generatePageRoutes({ to, from })
    if (pageRoutesResult && pageRoutesResult !== true) return pageRoutesResult
    const firstLoginResult = await checkUserFirstLogin({ to, from })
    if (firstLoginResult && firstLoginResult !== true) return firstLoginResult
    await store.dispatch('assets/getAssetCategories')
  } catch (e) {
    console.error('Startup error: ', e)
  }
  return true
}
