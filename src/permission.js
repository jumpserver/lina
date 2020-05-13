/* eslint-disable no-unused-vars */
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

const whiteList = ['/login', '/auth/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()
  if (!hasToken) {
    /* has no token*/

    // if (whiteList.indexOf(to.path) !== -1) {
    // // in the free login whitelist, go directly
    next()
    // } else {
    //   // other pages that do not have permission to access are redirected to the login page.
    //   next(`/login?redirect=${to.path}`)
    //   NProgress.done()
    return
  }

  if (to.path === '/login') {
    // if is logged in, redirect to the home page
    next({ path: '/' })
    NProgress.done()
    return
  }
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
    const { current_org_roles } = await store.dispatch('users/getProfile')

    // generate accessible routes map based on roles
    const accessRoutes = await store.dispatch('permission/generateRoutes', current_org_roles)

    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // hack method to ensure that addRoutes is complete
    // set the replace: true, so the navigation will not leave a history record
    next({
      ...to,
      replace: true
    })
  } catch (error) {
    // remove token and go to login page to re-login
    // await store.dispatch('user/resetToken')
    // Message.error(error || 'Has Error')
    // next(`/login?redirect=${to.path}`)
    // NProgress.done()
    next()
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
