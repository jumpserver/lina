export default {
  path: '/assets',
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
      component: () => import('@/views/assets/Domain/DomainList.vue'),
      meta: { title: 'DomainList' }
    },
    {
      path: 'domains/create',
      name: 'DomainCreate',
      component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
      meta: { title: 'DomainList' },
      hidden: true
    },
    {
      path: 'domains/:id/gateway',
      name: 'GatewayList',
      hidden: true,
      component: () => import('@/views/assets/GatewayList'),
      meta: { title: 'GatewayList' }
    },
    {
      path: 'admin-users',
      name: 'AdminUserList',
      component: () => import('@/views/assets/AdminUser/AdminUserList'),
      meta: { title: 'AdminUserList' }
    },
    {
      path: 'admin-users/create',
      component: () => import('@/views/assets/AdminUser/AdminUserCreateUpdate.vue'), // Parent router-view
      name: 'AdminUserCreateUpdate',
      meta: { title: 'AdminUserCreate' },
      hidden: true
    },
    {
      path: 'platform/update/:id',
      component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
      name: 'PlatformUpdate',
      meta: { title: 'PlatformUpdate' },
      hidden: true
    },
    {
      path: 'platform/detail/:id',
      component: () => import('@/views/assets/Platform/PlatformDetail.vue'), // Parent router-view
      name: 'PlatformDetail',
      meta: { title: 'PlatformDetail' },
      hidden: true
    },
    {
      path: 'platform/create',
      component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
      name: 'PlatformCreate',
      meta: { title: 'PlatformCreate' },
      hidden: true
    },
    {
      path: 'cmd-filters/update/:id',
      component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
      name: 'CommandFilterUpdate',
      meta: { title: 'CommandFilterUpdate' },
      hidden: true
    },
    {
      path: 'cmd-filters/create',
      component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
      name: 'CommandFilterCreate',
      meta: { title: 'CommandFilterCreate' },
      hidden: true
    },
    {
      path: 'cmd-filters/:id',
      component: () => import('@/views/assets/CommandFilter/CommandFilterDetail.vue'), // Parent router-view
      name: 'CommandFilterDetail',
      meta: { title: 'CommandFilterDetail' },
      hidden: true
    },
    {
      path: 'admin-users/:id',
      component: () => import('@/views/assets/AdminUser/AdminUserDetail.vue'), // Parent router-view
      name: 'AdminUserDetail',
      meta: { title: 'AdminUserDetail' },
      hidden: true
    },

    {
      path: 'system-users',
      name: 'SystemUserList',
      component: () => import('@/views/assets/SystemUserList.vue'),
      meta: { title: 'SystemUserList' }
    },
    {
      path: 'labels/create',
      name: 'LabelCreate',
      component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
      meta: { title: 'LabelCreate' },
      hidden: true
    },
    {
      path: 'labels/update/:id',
      name: 'LabelUpdate',
      component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
      meta: { title: 'LabelUpdate' }, hidden: true
    },
    {
      path: 'labels',
      name: 'LabelList',
      component: () => import('@/views/assets/Label/LabelList.vue'),
      meta: { title: 'LabelList' }
    },
    {
      path: 'cmd-filters',
      name: 'CommandFilterList',
      component: () => import('@/views/assets/CommandFilter/CommandFilterList.vue'),
      meta: { title: 'CommandFilterList' }
    },
    {
      path: 'platforms',
      name: 'PlatformList',
      component: () => import('@/views/assets/Platform/PlatformList'),
      meta: { title: 'PlatformList' }
    }
  ]
}
