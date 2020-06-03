import Vue from 'vue'
import Router from 'vue-router'
import i18n from '@/i18n/i18n'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

const requireContext = require.context('@/views/xpack/', true, /router\.js$/)
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
import UsersRoute from './users'
import AssetsRoute from './assets'
import ApplicationsRoute from './applications'
import PermsRoute from './perms'
import SessionsRoute from './sessions'
import OpsRoutes from './ops'
import TicketsRoutes from './tickets'
import AuditsRoutes from './audits'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// 全局路由
export const constantRoutes = [
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'UserProfile',
        component: () => import('@/userviews/users/UserProfile/index'),
        meta: { title: i18n.t('route.UserProfile'), icon: 'user', activeMenu: '/users/profile' }
      }
    ]
  }
]

/**
 * user routes
 * the routes that need to be dynamically loaded based on user roles
 */
// 权限路由
import userPageRoutes from './userPage'

/**
 * admin
 * the routes that need to be dynamically loaded based on admin roles
 */
export const allRoleRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: i18n.t('route.Dashboard'), icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    redirect: '/users/users/',
    name: 'Users',
    meta: {
      title: i18n.t('route.Users'),
      icon: 'users'
    },
    children: UsersRoute
  },
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets/',
    name: 'assets',
    meta: { title: i18n.t('route.Assets'), icon: 'inbox' },
    children: AssetsRoute
  },
  {
    path: '/applications/',
    component: Layout,
    redirect: '/applications/remote-apps/',
    name: 'applications',
    meta: { title: i18n.t('route.Applications'), icon: 'th' },
    children: ApplicationsRoute
  },
  {
    path: '/perms/',
    component: Layout,
    redirect: '/perms/asset-permissions/',
    name: 'Perms',
    meta: { title: i18n.t('route.Perms'), icon: 'edit' },
    children: PermsRoute
  },
  {
    path: '/terminal/',
    component: Layout,
    redirect: '/terminal/session-online/',
    name: 'Sessions',
    meta: { title: i18n.t('route.Sessions'), icon: 'rocket' },
    children: SessionsRoute
  },
  {
    path: '/ops/',
    component: Layout,
    redirect: '/ops/tasks/',
    name: 'JobCenter',
    meta: { title: i18n.t('route.JobCenter'), icon: 'coffee' },
    children: OpsRoutes
  },
  {
    name: 'Tickets',
    path: '/tickets/',
    component: Layout,
    redirect: '/tickets/tickets/',
    children: TicketsRoutes,
    meta: {
      licenseRequired: true
    }
  },
  {
    path: '/audits/',
    component: Layout,
    redirect: '/audits/login-log/',
    name: 'Audits',
    meta: { title: i18n.t('route.Audits'), icon: 'history' },
    children: AuditsRoutes
  },
  ...requireContext.keys().map(key => requireContext(key).default),
  {
    name: 'Settings',
    path: '/settings',
    component: Layout,
    redirect: '/settings/',
    children: [{
      path: 'settings',
      name: 'Settings',
      component: () => import('@/views/settings/index'),
      meta: { title: i18n.t('route.Settings'), icon: 'gears', roles: ['SuperAdmin'] }
    }]
  },
  ...userPageRoutes,
  { path: '*', redirect: '/404', hidden: true, meta: { roles: ['SuperAdmin', 'Admin', 'Auditor', 'User'] }}
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
