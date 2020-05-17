import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

const requireContext = require.context('@/views/', true, /router\.js$/)
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
import UsersRoute from './admin/users'
import AssetsRoute from './admin/assets'
import ApplicationsRoute from './admin/applications'
import PermsRoute from './admin/perms'
import SessionsRoute from './admin/sessions'
import OpsRoutes from './admin/jobcenter'
import TicketsRoutes from './admin/tickets'
import AuditsRoutes from './admin/audits'

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
  }
]

export const adminRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'Dashboard', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    redirect: '/users/users/',
    name: 'Users',
    meta: {
      title: 'Users',
      icon: 'users'
    },
    children: UsersRoute
  },
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets/',
    name: 'assets',
    meta: { title: 'Assets', icon: 'inbox' },
    children: AssetsRoute
  },
  {
    path: '/applications/',
    component: Layout,
    redirect: '/applications/remote-apps/',
    name: 'applications',
    meta: { title: 'Applications', icon: 'th' },
    children: ApplicationsRoute
  },
  {
    path: '/perms/',
    component: Layout,
    redirect: '/perms/asset-permissions/',
    name: 'Perms',
    meta: { title: 'Perms', icon: 'edit' },
    children: PermsRoute
  },
  {
    path: '/terminal/',
    component: Layout,
    redirect: '/terminal/session-online/',
    name: 'Sessions',
    meta: { title: 'Sessions', icon: 'rocket' },
    children: SessionsRoute
  },
  {
    path: '/ops/',
    component: Layout,
    redirect: '/ops/tasks/',
    name: 'JobCenter',
    meta: { title: 'JobCenter', icon: 'coffee' },
    children: OpsRoutes
  },
  {
    path: '/tickets/',
    component: Layout,
    redirect: '/tickets/tickets/',
    children: TicketsRoutes
  },
  {
    path: '/audits/',
    component: Layout,
    redirect: '/audits/login-log/',
    name: 'Audits',
    meta: { title: 'Audits', icon: 'history' },
    children: AuditsRoutes
  },
  ...requireContext.keys().map(key => requireContext(key).default),
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/',
    children: [{
      path: 'settings',
      name: 'Settings',
      component: () => import('@/views/settings/index'),
      meta: { title: 'Settings', icon: 'gears' }
    }]
  },
  { path: '*', redirect: '/404', hidden: true }
]
/**
 * user routes
 * the routes that need to be dynamically loaded based on user roles
 */
// 权限路由
export const userRoutes = [
  // 404 page must be placed at the end !!!
  {
    path: '/assets',
    component: Layout,
    children: [
      {
        path: 'assets',
        name: 'AssetList',
        component: () => import('@/views/user/asset/index.vue'),
        meta: { title: 'AssetList', icon: 'files-o' }
      }
    ]
  },
  {
    path: '/applications',
    component: Layout,
    children: [
      {
        path: '/remoteapp',
        name: 'RemoteApp',
        component: () => import('@/views/user/users/index.vue'),
        meta: { title: 'RemoteApp' }
      },
      {
        path: '/database',
        name: 'UserProfile',
        component: () => import('@/views/user/users/index.vue'),
        meta: { title: 'Database' }
      }
    ],
    meta: { title: 'MyApplications', icon: 'th' }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '/users/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/users/index.vue'),
        meta: { title: 'UserProfile', icon: 'user' }
      }
    ]
  },
  {
    path: '/command-executions',
    component: Layout,
    children: [
      {
        path: '',
        name: 'CommandExecutions',
        component: () => import('@/views/user/users/index.vue'),
        meta: { title: 'CommandExecutions', icon: 'terminal' }
      }
    ]
  },
  {
    path: 'webterminal',
    component: Layout,
    children: [
      {
        path: 'webterminal',
        name: 'Terminal',
        meta: { title: 'Terminal', icon: 'window-maximize' }
      }
    ]
  },
  {
    path: 'web-sftp',
    component: Layout,
    children: [
      {
        path: 'web-sftp',
        name: 'WebSftp',
        meta: { title: 'WebSftp', icon: 'file' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  mode: 'history',
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
