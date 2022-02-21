/* eslint-disable no-unused-vars */
import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'

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
  const fromView = from?.path.split('/')[1]
  const toView = to?.path.split('/')[1]
  if (fromView !== toView) {
    return store.dispatch('permission/generateViewRoutes', { to: to, from: from })
  }
}

function setPageTitle() {
  const currentRoute = router.currentRoute
  const loginTitle = store.getters.publicSettings['LOGIN_TITLE']
  document.title = currentRoute.meta.title + ' - ' + loginTitle
}

router.afterEach(async(to, from) => {
  // finish progress bar
  await setPageTitle()
  NProgress.done()
  await generateViewRoutesIfChange({ to, from })
})

