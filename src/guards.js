/* eslint-disable no-unused-vars */
import router from './router'
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { isSameView } from '@/utils/jms'
import { toSentenceCase } from '@/utils/common'

function beforeRouteChange(to, from, next) {
  localStorage.setItem('activeTab', '')
}

router.beforeEach(async(to, from, next) => {
  // start progress bar
  // NProgress.start()
  try {
    await store.dispatch('common/cleanDrawerActionMeta')
    await startup({ to, from, next })
    if (to.name && from.name && to.name !== from.name) {
      await beforeRouteChange(to, from, next)
    }
    next()
  } catch (e) {
    const msg = 'Start service error: ' + e
    console.log(msg)
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
  const loginTitle = store.getters.publicSettings['INTERFACE']['login_title']
  const routeTitle = toSentenceCase(currentRoute.meta.title)
  if (routeTitle) {
    document.title = routeTitle + ' - ' + loginTitle
  }
}

router.afterEach(async(to, from) => {
  // finish progress bar
  await setPageTitle()
  await generateViewRoutesIfChange({ to, from })
  // NProgress.done()
})

