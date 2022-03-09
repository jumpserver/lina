/* eslint-disable no-unused-vars */
import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { getPropView, getRouteViewRequirePerms, hasPermission } from '@/utils/jms'
import Vue from 'vue'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  try {
    await startup({ to, from, next })
    await changeCurrentViewIfNeed({ to, from, next })
    next()
  } catch (e) {
    const msg = 'Start service error: ' + e
    console.log(e)
  }
})

function generateViewRoutesIfChange({ to, from }) {
  const fromView = from?.path.split('/')[1]
  const toView = to?.path.split('/')[1]
  if (fromView !== toView) {
    return store.dispatch('permission/generateViewRoutes', { to: to, from: from })
  }
}

function setPageTitle() {
  const currentRoute = router.currentRoute
  const loginTitle = store.getters.publicSettings['LOGIN_TITLE']
  const routeTitle = currentRoute.meta.title
  if (routeTitle) {
    document.title = routeTitle + ' - ' + loginTitle
  }
}

function changeCurrentViewIfNeed({ to, from, next }) {
  if (to.path.slice(0, 5) === from.path.slice(0, 5)) {
    return
  }
  const viewRequirePerms = getRouteViewRequirePerms(to)
  const hasPerm = hasPermission(viewRequirePerms)
  Vue.$log.debug('Change current view if need: ', viewRequirePerms, hasPerm)
  if (hasPerm) {
    Vue.$log.debug('Has current view perm')
    return
  }
  const view = getPropView()
  next({ name: view })
}

router.afterEach(async(to, from) => {
  // finish progress bar
  await setPageTitle()
  NProgress.done()
  await generateViewRoutesIfChange({ to, from })
})

