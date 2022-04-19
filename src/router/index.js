import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'
import i18n from '@/i18n/i18n'

Vue.use(Router)

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */
import commonRoutes from './common'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// 全局路由
export const constantRoutes = [
  {
    path: '',
    component: Layout,
    redirect: '',
    meta: {
      type: 'view',
      view: 'home',
      title: i18n.t('route.Index')
    },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/myhome/index'),
        meta: {
          icon: 'dashboard',
          title: i18n.t('route.Overview')
        },
        beforeEnter: async(to, from, next) => {
          const preferView = getPropView()
          if (preferView) {
            await store.dispatch('app/reset')
            next(`/${preferView}/`)
            return false
          }
          next()
          return false
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true
  },
  ...commonRoutes
]

/**
 * user routes
 * the routes that need to be dynamically loaded based on user roles
 */
// 权限路由
import consoleViewRoutes from './console'
import auditViewRoutes from './audit'
import workbenchViewRoutes from './workbench'
import ticketsRoutes from './tickets'
import settingsRoutes from './settings'
import profileRoutes from './profile'
import { getPropView } from '@/utils/jms'
import store from '@/store'

/**
 * admin
 * the routes that need to be dynamically loaded based on admin roles
 */
export const viewRoutes = [
  consoleViewRoutes,
  auditViewRoutes,
  workbenchViewRoutes,
  ticketsRoutes,
  settingsRoutes,
  profileRoutes
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  base: '/ui/',
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
