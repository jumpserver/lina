/* eslint-disable no-unused-vars */
import router from './router'
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'
import store from '@/store'
import { isSameView } from '@/utils/jms/index'
import { toSentenceCase } from '@/utils/common/index'
import { scopedLocalStorage as localStorage } from '@/utils/storage'
import i18n from '@/i18n/i18n'

function beforeRouteChange(to, from) {
  localStorage.setItem('activeTab', '')
}

router.beforeEach(async (to, from) => {
  // start progress bar
  // NProgress.start()
  try {
    // 仅在真正切换页面(path/name 变化)时清理抽屉 meta 并关闭抽屉。
    // 同路由的 query/hash 变化(如抽屉详情内 TabPage 点 tab 触发的 $router.replace({query:{tab}}))
    // 不应被视为离开页面,否则会误关抽屉。
    const isSameRouteQueryChange = to.path === from.path && to.name === from.name
    if (!isSameRouteQueryChange) {
      await store.dispatch('common/cleanDrawerActionMeta')
    }
    const startupResult = await startup({ to, from })
    if (startupResult && startupResult !== true) {
      return startupResult
    }
    if (to.name && from.name && to.name !== from.name) {
      await beforeRouteChange(to, from)
    }
    return true
  } catch (e) {
    const msg = 'Start service error: ' + e
    console.log(msg)
    return false
  }
})

function generateViewRoutesIfChange({ to, from }) {
  const sameView = isSameView(to, from)
  console.log('sameView', sameView)
  // On first load, after startup's replace navigation, from/to may be same view.
  // Ensure we still set currentViewRoute if it hasn't been set.
  const hasCurrent = !!store.state?.permission?.currentViewRoute?.meta?.view
  if (!sameView || !hasCurrent) {
    console.log('generateViewRoutesIfChange', to, from)
    return store.dispatch('permission/generateViewRoutes', { to: to, from: from })
  }
}

function setPageTitle() {
  const currentRoute = router.currentRoute?.value || router.currentRoute
  const loginTitle = store.getters.publicSettings['INTERFACE']['login_title']
  const rawTitle = currentRoute?.meta?.title
  // meta.title 是在路由模块加载时用 i18n.t(...) 求值的，那时后端多语言尚未拉取，
  // 值会被冻结成英文 key；这里在运行时（翻译已就绪后）再翻译一次，保证 tab 标题被正确翻译。
  const routeTitle = rawTitle ? toSentenceCase(i18n.global.t(rawTitle)) : ''
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
