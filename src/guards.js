/* eslint-disable no-unused-vars */
import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { getPropView, hasRouteViewPerm, isSameView } from '@/utils/jms'
import Vue from 'vue'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  try {
    await startup({ to, from, next })
    next()
  } catch (e) {
    const msg = 'Start service error: ' + e
    console.log(e)
  }
})

function generateViewRoutesIfChange({ to, from }) {
  const sameView = isSameView(to, from)
  if (!sameView) {
    return store.dispatch('permission/generateViewRoutes', { to: to, from: from })
  }
}

async function changeCurrentViewIfNeed({ to, from, next }) {
  if (!to.path || isSameView(to, from)) {
    return
  }
  const hasPerm = hasRouteViewPerm(to)
  Vue.$log.debug('Change has current view, has perm: ', hasPerm)
  if (hasPerm) {
    return
  }
  const view = getPropView()
  Vue.$log.debug('Get prop view and goto: ', view)
  next(`/${view}`)
}

function setPageTitle() {
  const currentRoute = router.currentRoute
  const loginTitle = store.getters.publicSettings['LOGIN_TITLE']
  const routeTitle = currentRoute.meta.title
  if (routeTitle) {
    document.title = routeTitle + ' - ' + loginTitle
  }
}

router.beforeResolve(async(to, from, next) => {
  /* must call `next` */
  await changeCurrentViewIfNeed({ to, from, next })
  next()
})

router.afterEach(async(to, from) => {
  // finish progress bar
  await setPageTitle()
  await generateViewRoutesIfChange({ to, from })
  NProgress.done()
})

