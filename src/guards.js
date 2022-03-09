/* eslint-disable no-unused-vars */
import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { getPropView, getRouteViewRequirePerms, hasPermission, isSameView } from '@/utils/jms'
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

function setPageTitle() {
  const currentRoute = router.currentRoute
  const loginTitle = store.getters.publicSettings['LOGIN_TITLE']
  const routeTitle = currentRoute.meta.title
  if (routeTitle) {
    document.title = routeTitle + ' - ' + loginTitle
  }
}

router.afterEach(async(to, from, next) => {
  // finish progress bar
  await setPageTitle()
  await generateViewRoutesIfChange({ to, from })
  NProgress.done()
  // await changeCurrentViewIfNeed({ to, from, next })
})

