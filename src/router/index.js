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
    redirect: '/user/list',
    name: 'Users',
    meta: {
      title: 'Users',
      icon: 'nested'
    },
    children: [
      {
        path: 'user/list',
        component: () => import('@/views/users/UserList.vue'), // Parent router-view
        name: 'UserList',
        meta: { title: 'UserList' }
      },
      {
        path: 'user/:id',
        component: () => import('@/views/users/UserEdit.vue'), // Parent router-view
        name: 'UserEdit',
        meta: { title: 'UserEdit' },
        hidden: true
      },
      {
        path: 'user/detail/:id',
        component: () => import('@/views/users/UserDetail.vue'), // Parent router-view
        name: 'UserDetail',
        meta: { title: 'UserDetail' },
        hidden: true
      },
      {
        path: 'usergroup/list',
        component: () => import('@/views/users/UserGroupList.vue'), // Parent router-view
        name: 'UserGroupList',
        meta: { title: 'UserGroupList' }
      },
      {
        path: 'usergroup/:id',
        component: () => import('@/views/users/UserGroupEdit.vue'), // Parent router-view
        name: 'UserGroupEdit',
        meta: { title: 'UserGroupEdit' },
        hidden: true
      },
      {
        path: 'usergroup/detail/:id',
        component: () => import('@/views/users/UserGroupDetail.vue'), // Parent router-view
        name: 'UserGroupDetail',
        meta: { title: 'UserGroupDetail' },
        hidden: true
      }
    ]
  },
  {
    path: '/assets',
    component: Layout,
    redirect: '/asset/list',
    name: 'assets',
    meta: { title: 'Assets', icon: 'user' },
    children: [
      {
        path: 'asset/list',
        name: 'AssetList',
        component: () => import('@/views/assets/AssetList.vue'),
        meta: { title: 'AssetList' }
      },
      {
        path: 'domain/list',
        name: 'DomainList',
        component: () => import('@/views/assets/DomainList.vue'),
        meta: { title: 'DomainList' }
      },
      {
        path: 'admin-user/list',
        name: 'AdminUserList',
        component: () => import('@/views/assets/AdminUserList'),
        meta: { title: 'AdminUserList' }
      },
      {
        path: 'admin-user/detail/:id',
        component: () => import('@/views/assets/AdminUserDetail.vue'), // Parent router-view
        name: 'AdminUserDetail',
        meta: { title: 'AdminUserDetail' },
        hidden: true
      },
      {
        path: 'system-user/list',
        name: 'SystemUserList',
        component: () => import('@/views/assets/SystemUserList.vue'),
        meta: { title: 'SystemUserList' }
      },
      {
        path: 'label/list',
        name: 'LabelList',
        component: () => import('@/views/assets/LabelList.vue'),
        meta: { title: 'LabelList' }
      },
      {
        path: 'cmd-filter/list',
        name: 'CommandFilterList',
        component: () => import('@/views/assets/CommandFilterList.vue'),
        meta: { title: 'CommandFilterList' }
      },
      {
        path: 'platforms',
        name: 'platformList',
        component: () => import('@/views/tree/index'),
        meta: { title: 'platformList' }
      }
    ]
  },
  {
    path: '/applications/',
    component: Layout,
    name: 'applications',
    meta: { title: 'applications', icon: 'user' },
    children: [
      {
        path: 'remote-apps',
        name: 'remoteAppList',
        component: () => import('@/views/table/index'),
        meta: { title: 'remoteAppList' }
      },
      {
        path: 'databases',
        name: 'databaseList',
        component: () => import('@/views/tree/index'),
        meta: { title: 'databaseList' }
      }
    ]
  },
  {
    path: '/perms/',
    component: Layout,
    name: 'perms',
    meta: { title: 'perms', icon: 'user' },
    children: [
      {
        path: 'static-permissions',
        name: 'assetPermissionList',
        component: () => import('@/views/table/index'),
        meta: { title: 'assetPermissionList' }
      },
      {
        path: 'remote-apps-permissions',
        name: 'remoteAppPermissionList',
        component: () => import('@/views/tree/index'),
        meta: { title: 'remoteAppPermissionList' }
      },
      {
        path: 'database-permissions',
        name: 'databasePermissionList',
        component: () => import('@/views/tree/index'),
        meta: { title: 'databasePermissionList' }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Form',
        component: () => import('@/views/form/index'),
        meta: { title: 'Form', icon: 'form' }
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
  //       component: () => import('@/views/users/UserEdit.vue'), // Parent router-view
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
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
