import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

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
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'dashboard', icon: 'dashboard' }
    }]
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
    children: [
      {
        path: 'users',
        component: () => import('@/views/users/UserList.vue'), // Parent router-view
        name: 'UserList',
        meta: { title: 'UserList' }
      },
      {
        path: 'users/create',
        component: () => import('@/views/users/UserCreate.vue'), // Parent router-view
        name: 'UserCreate',
        meta: { title: 'UserCreate' },
        hidden: true
      },
      {
        path: 'users/:id',
        component: () => import('@/views/users/UserDetail.vue'), // Parent router-view
        name: 'UserDetail',
        meta: { title: 'UserDetail', activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: 'groups',
        component: () => import('@/views/users/UserGroupList.vue'), // Parent router-view
        name: 'UserGroupList',
        meta: { title: 'UserGroupList' }
      },
      {
        path: 'groups/:id/update',
        component: () => import('@/views/users/UserGroupEdit.vue'), // Parent router-view
        name: 'UserGroupEdit',
        meta: { title: 'UserGroupEdit' },
        hidden: true
      },
      {
        path: 'groups/:id',
        component: () => import('@/views/users/UserGroupDetail.vue'), // Parent router-view
        name: 'UserGroupDetail',
        meta: { title: 'UserGroupDetail', activeMenu: '/users/groups' },
        hidden: true
      }
    ]
  },
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/assets/',
    name: 'assets',
    meta: { title: 'Assets', icon: 'inbox' },
    children: [
      {
        path: 'assets',
        name: 'AssetList',
        component: () => import('@/views/assets/AssetList.vue'),
        meta: { title: 'AssetList' }
      },
      {
        path: 'domains',
        name: 'DomainList',
        component: () => import('@/views/assets/DomainList.vue'),
        meta: { title: 'DomainList' }
      },
      {
        path: 'admin-users',
        name: 'AdminUserList',
        component: () => import('@/views/assets/AdminUserList'),
        meta: { title: 'AdminUser' }
      },
      {
        path: 'admin-users/:id',
        component: () => import('@/views/assets/AdminUserDetail.vue'), // Parent router-view
        name: 'AdminUserDetail',
        meta: { title: 'AdminUserDetail' },
        hidden: true
      },
      {
        path: 'system-users',
        name: 'SystemUserList',
        component: () => import('@/views/assets/SystemUserList.vue'),
        meta: { title: 'SystemUser' }
      },
      {
        path: 'labels',
        name: 'LabelList',
        component: () => import('@/views/assets/LabelList.vue'),
        meta: { title: 'Labels' }
      },
      {
        path: 'cmd-filters',
        name: 'CommandFilterList',
        component: () => import('@/views/assets/CommandFilterList.vue'),
        meta: { title: 'CommandFilters' }
      },
      {
        path: 'platforms',
        name: 'platformList',
        component: () => import('@/views/tree/index'),
        meta: { title: 'PlatformList' }
      }
    ]
  },
  {
    path: '/applications/',
    component: Layout,
    redirect: '/applications/remote-apps/',
    name: 'applications',
    meta: { title: 'Applications', icon: 'th' },
    children: [
      {
        path: 'remote-apps',
        name: 'remoteAppList',
        component: () => import('@/views/applications/RemoteAppList'),
        meta: { title: 'RemoteApp' }
      },
      {
        path: 'database-apps',
        name: 'DatabaseAppList',
        component: () => import('@/views/applications/DatabaseAppList'),
        meta: { title: 'DatabaseApp' }
      }
    ]
  },
  {
    path: '/perms/',
    component: Layout,
    redirect: '/perms/asset-permission/',
    name: 'Perms',
    meta: { title: 'Perms', icon: 'edit' },
    children: [
      {
        path: 'asset-permissions',
        name: 'AssetPermissionList',
        component: () => import('@/views/perms/AssetPermissionList'),
        meta: { title: 'AssetPermission' }
      },
      {
        path: 'remote-app-permissions',
        name: 'RemoteAppPermissionList',
        component: () => import('@/views/perms/RemoteAppPermissionList'),
        meta: { title: 'RemoteAppPermission' }
      },
      {
        path: 'database-app-permissions',
        name: 'DatabasePermissionList',
        component: () => import('@/views/perms/DatabaseAppPermissionList'),
        meta: { title: 'DatabasePermission' }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
// 权限路由
export const asyncRoutes = [
  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'Nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },
  // {
  //   path: '/users',
  //   component: Layout,
  //   redirect: '/users/list',
  //   name: 'Users',
  //   meta: {
  //     title: 'Users',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'user/list',
  //       component: () => import('@/views/users/UserList.vue'), // Parent router-view
  //       name: 'UserList',
  //       meta: { title: 'List' }
  //     },
  //     {
  //       path: 'user/:id',
  //       component: () => import('@/views/users/UserCreate.vue'), // Parent router-view
  //       name: 'UserEdit',
  //       meta: { title: 'Edit' },
  //       hidden: true
  //     }
  //   ]
  // },
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
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
