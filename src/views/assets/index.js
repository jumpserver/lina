export default [
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
    meta: { title: 'DomainList', activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'domains/:id',
    name: 'DomainDetail',
    component: () => import('@/views/assets/Domain/DomainDetail/index.vue'),
    meta: { title: 'DomainDetail', activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'domains/:domainid/gateway/create',
    name: 'GatewayCreate',
    component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
    meta: { title: 'GatewayCreate', activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'domains/gateway/:id/create',
    name: 'GatewayUpdate',
    component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
    meta: { title: 'GatewayUpdate', activeMenu: '/assets/domains' },
    hidden: true
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
    name: 'AdminUserCreate',
    meta: { title: 'AdminUserCreate', activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'admin-users/update/:id',
    component: () => import('@/views/assets/AdminUser/AdminUserCreateUpdate.vue'), // Parent router-view
    name: 'AdminUserUpdate',
    meta: { title: 'AdminUserUpdate', activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'platform/update/:id',
    component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
    name: 'PlatformUpdate',
    meta: { title: 'PlatformUpdate', activeMenu: '/assets/platform' },
    hidden: true
  },
  {
    path: 'platform/detail/:id',
    component: () => import('@/views/assets/Platform/PlatformDetail.vue'), // Parent router-view
    name: 'PlatformDetail',
    meta: { title: 'PlatformDetail', activeMenu: '/assets/platform' },
    hidden: true
  },
  {
    path: 'platform/create',
    component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
    name: 'PlatformCreate',
    meta: { title: 'PlatformCreate', activeMenu: '/assets/platform' },
    hidden: true
  },
  {
    path: 'cmd-filters/update/:id',
    component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterUpdate',
    meta: { title: 'CommandFilterUpdate', activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/create',
    component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterCreate',
    meta: { title: 'CommandFilterCreate', activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/:ruleid/rule/create',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpate.vue'), // Parent router-view
    name: 'CommandFilterRulesCreate',
    meta: { title: 'CommandFilterRulesCreate', activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/:ruleid/rule/:id/update',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpate.vue'), // Parent router-view
    name: 'CommandFilterRulesUpdate',
    meta: { title: 'CommandFilterRulesUpdate', activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/:id',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/index.vue'), // Parent router-view
    name: 'CommandFilterDetail',
    meta: { title: 'CommandFilterDetail', activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'admin-users/:id',
    component: () => import('@/views/assets/AdminUser/AdminUserDetail/index.vue'), // Parent router-view
    name: 'AdminUserDetail',
    meta: { title: 'AdminUserDetail', activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'system-users/create',
    name: 'SystemUserCreate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: 'SystemUserCreate', activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'system-users/update/:id',
    name: 'SystemUserUpdate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: 'SystemUserUpdate', activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'system-users/:id',
    name: 'SystemUserDetail',
    component: () => import('@/views/assets/SystemUser/SystemUserDetail/index.vue'),
    meta: { title: 'SystemUserDetail', activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'system-users',
    name: 'SystemUserList',
    component: () => import('@/views/assets/SystemUser/SystemUserList.vue'),
    meta: { title: 'SystemUserList', activeMenu: '/assets/system-users' }
  },
  {
    path: 'labels/create',
    name: 'LabelCreate',
    component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
    meta: { title: 'LabelCreate', activeMenu: '/assets/labels' },
    hidden: true
  },
  {
    path: 'labels/update/:id',
    name: 'LabelUpdate',
    component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
    meta: { title: 'LabelUpdate', activeMenu: '/assets/labels' }, hidden: true
  },
  {
    path: 'labels',
    name: 'LabelList',
    component: () => import('@/views/assets/Label/LabelList.vue'),
    meta: { title: 'LabelList', activeMenu: '/assets/labels' }
  },
  {
    path: 'cmd-filters',
    name: 'CommandFilterList',
    component: () => import('@/views/assets/CommandFilter/CommandFilterList.vue'),
    meta: { title: 'CommandFilterList', activeMenu: '/assets/cmd-filters' }
  },
  {
    path: 'platforms',
    name: 'PlatformList',
    component: () => import('@/views/assets/Platform/PlatformList'),
    meta: { title: 'PlatformList', activeMenu: '/assets/platforms' }
  }
]
