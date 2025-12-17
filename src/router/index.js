import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'
import i18n from '@/i18n/i18n'
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
import pamViewRoutes from './pam'
import reportsViewRoutes from './reports'
import { getPropView } from '@/utils/jms/index'
import store from '@/store'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// 全局路由
export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/console',
    meta: {
      type: 'view',
      view: 'home',
      title: i18n.global.t('Index')
    },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/workbench/overview/index'),
        meta: {
          icon: 'dashboard',
          title: i18n.global.t('Overview')
        },
        beforeEnter: async (to, from, next) => {
          const preferView = getPropView()
          if (preferView) {
            await store.dispatch('app/reset')
            next(`/${preferView}`)
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
 * admin
 * the routes that need to be dynamically loaded based on admin roles
 */
export const viewRoutes = [
  consoleViewRoutes,
  pamViewRoutes,
  auditViewRoutes,
  workbenchViewRoutes,
  ticketsRoutes,
  settingsRoutes,
  profileRoutes,
  reportsViewRoutes
]

const createRouterInstance = () =>
  createRouter({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ top: 0 }),
    history: createWebHashHistory('/ui/'),
    routes: constantRoutes
  })

const router = createRouterInstance()

export function resetRouter() {
  // Remove dynamic routes
  router.getRoutes().forEach(route => {
    const name = route.name
    if (name && name !== 'home' && name !== '404' && router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
}

export default router
