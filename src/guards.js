/* eslint-disable no-unused-vars */
import router from './router'
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { isSameView } from '@/utils/jms/index'
import { toSentenceCase } from '@/utils/common/index'

function beforeRouteChange(to, from, next) {
  localStorage.setItem('activeTab', '')
}

router.beforeEach(async (to, from, next) => {
  // start progress bar
  // NProgress.start()
  // ensure next() is called at most once
  let proceeded = false
  const nextOnce = (...args) => {
    if (proceeded) return
    proceeded = true
    return next(...args)
  }
  try {
    await store.dispatch('common/cleanDrawerActionMeta')
    await startup({ to, from, next: nextOnce })
    if (!proceeded) {
      if (to.name && from.name && to.name !== from.name) {
        await beforeRouteChange(to, from, nextOnce)
      }
      nextOnce()
    }
  } catch (e) {
    const msg = 'Start service error: ' + e
    console.log(msg)
  }
})

function generateViewRoutesIfChange({ to, from }) {
  const sameView = isSameView(to, from)
  console.log('sameView', sameView)
  // On first load, after startup's replace navigation, from/to may be same view.
  // Ensure we still set currentViewRoute if it hasn't been set.
  const hasCurrent = !!(store.state?.permission?.currentViewRoute?.meta?.view)
  if (!sameView || !hasCurrent) {
    console.log('generateViewRoutesIfChange', to, from)
    return store.dispatch('permission/generateViewRoutes', { to: to, from: from })
  }
}

function setPageTitle() {
  const currentRoute = router.currentRoute?.value || router.currentRoute
  const loginTitle = store.getters.publicSettings['INTERFACE']['login_title']
  const routeTitle = toSentenceCase(currentRoute?.meta?.title)
  if (routeTitle) {
    document.title = routeTitle + ' - ' + loginTitle
  }
}

router.afterEach(async (to, from) => {
  // finish progress bar
  await setPageTitle()
  await generateViewRoutesIfChange({ to, from })
  try {
    const view = store.state?.permission?.currentViewRoute?.meta?.view
    if (view) {
      console.log('generateViewRoutes done:', view)
    } else {
      console.log('generateViewRoutes done: no currentViewRoute yet')
    }
  } catch (e) {
    console.log('log currentViewRoute failed', e)
  }
  // NProgress.done()
})
