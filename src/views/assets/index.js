import Layout from '@/layout'

const AssetsRoute = [
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
    name: 'AdminUserCreate',
    meta: { title: 'AdminUserCreate' },
    hidden: true
  },
  {
    path: 'admin-users/update/:id',
    component: () => import('@/views/assets/AdminUser/AdminUserCreateUpdate.vue'), // Parent router-view
    name: 'AdminUserUpdate',
    meta: { title: 'AdminUserUpdate' },
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
    path: 'cmd-filters/:ruleid/rule/create',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpate.vue'), // Parent router-view
    name: 'CommandFilterRulesCreate',
    meta: { title: 'CommandFilterRulesCreate' },
    hidden: true
  },
  {
    path: 'cmd-filters/:ruleid/rule/:id/update',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpate.vue'), // Parent router-view
    name: 'CommandFilterRulesUpdate',
    meta: { title: 'CommandFilterRulesUpdate' },
    hidden: true
  },
  {
    path: 'cmd-filters/:id',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/index.vue'), // Parent router-view
    name: 'CommandFilterDetail',
    meta: { title: 'CommandFilterDetail' },
    hidden: true
  },
  {
    path: 'admin-users/:id',
    component: () => import('@/views/assets/AdminUser/AdminUserDetail/index.vue'), // Parent router-view
    name: 'AdminUserDetail',
    meta: { title: 'AdminUserDetail' },
    hidden: true
  },
  {
    path: 'system-users/create',
    name: 'SystemUserCreate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: 'SystemUserCreate' },
    hidden: true
  },
  {
    path: 'system-users/update/:id',
    name: 'SystemUserUpdate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: 'SystemUserUpdate' },
    hidden: true
  },
  {
    path: 'system-users/:id',
    name: 'SystemUserDetail',
    component: () => import('@/views/assets/SystemUser/SystemUserDetail/index.vue'),
    meta: { title: 'SystemUserDetail' },
    hidden: true
  },
  {
    path: 'system-users',
    name: 'SystemUserList',
    component: () => import('@/views/assets/SystemUser/SystemUserList.vue'),
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
export default {
  path: '/assets',
  component: Layout,
  redirect: '/assets/assets/',
  name: 'assets',
  meta: { title: 'Assets', icon: 'inbox' },
  children: AssetsRoute
}
