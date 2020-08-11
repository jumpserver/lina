import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
export default [
  {
    path: 'assets',
    name: 'AssetList',
    component: () => import('@/views/assets/Asset/AssetList.vue'),
    meta: { title: i18n.t('route.AssetList'), activeMenu: '/assets/assets' }
  },
  {
    path: 'assets/create',
    name: 'AssetCreate',
    component: () => import('@/views/assets/Asset/AssetCreateUpdate.vue'),
    meta: { title: i18n.t('route.AssetCreate'), activeMenu: '/assets/assets' },
    hidden: true
  },
  {
    path: 'assets/:id',
    name: 'AssetDetail',
    component: () => import('@/views/assets/Asset/AssetDetail/index.vue'),
    meta: { title: i18n.t('route.AssetDetail'), activeMenu: '/assets/assets' },
    hidden: true
  },
  {
    path: 'assets/:id/update',
    name: 'AssetUpdate',
    component: () => import('@/views/assets/Asset/AssetCreateUpdate.vue'),
    meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/assets/assets' },
    hidden: true
  },
  {
    path: 'domains',
    name: 'DomainList',
    component: () => import('@/views/assets/Domain/DomainList.vue'),
    meta: { title: i18n.t('route.DomainList'), activeMenu: '/assets/domains' }
  },
  {
    path: 'domains/create',
    name: 'DomainCreate',
    component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
    meta: { title: i18n.t('route.DomainCreate'), activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'domains/:id/update',
    name: 'DomainUpdate',
    component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
    meta: { title: i18n.t('route.DomainUpdate'), activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'domains/:id',
    name: 'DomainDetail',
    component: () => import('@/views/assets/Domain/DomainDetail/index.vue'),
    meta: { title: i18n.t('route.DomainDetail'), activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'gateways/create',
    name: 'GatewayCreate',
    component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
    meta: { title: i18n.t('route.GatewayCreate'), activeMenu: '/assets/domains' },
    hidden: true
  },
  {
    path: 'gateways/:id/update',
    name: 'GatewayUpdate',
    component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
    meta: { title: i18n.t('route.GatewayUpdate'), activeMenu: '/assets/domains' },
    hidden: true
  },
  {

    path: 'admin-users',
    name: 'AdminUserList',
    component: () => import('@/views/assets/AdminUser/AdminUserList'),
    meta: { title: i18n.t('route.AdminUserList'), activeMenu: '/assets/admin-users' }
  },
  {
    path: 'admin-users/create',
    component: () => import('@/views/assets/AdminUser/AdminUserCreateUpdate.vue'), // Parent router-view
    name: 'AdminUserCreate',
    meta: { title: i18n.t('route.AdminUserCreate'), activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'admin-users/:id/update',
    component: () => import('@/views/assets/AdminUser/AdminUserCreateUpdate.vue'), // Parent router-view
    name: 'AdminUserUpdate',
    meta: { title: i18n.t('route.AdminUserUpdate'), activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'admin-users/:id',
    component: () => import('@/views/assets/AdminUser/AdminUserDetail/index.vue'), // Parent router-view
    name: 'AdminUserDetail',
    meta: { title: i18n.t('route.AdminUserDetail'), activeMenu: '/assets/admin-users' },
    hidden: true
  },
  {
    path: 'system-users',
    name: 'SystemUserList',
    component: () => import('@/views/assets/SystemUser/SystemUserList.vue'),
    meta: { title: i18n.t('route.SystemUserList'), activeMenu: '/assets/system-users' }
  },
  {
    path: 'system-users/create',
    name: 'SystemUserCreate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: i18n.t('route.SystemUserCreate'), activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'system-users/:id/update',
    name: 'SystemUserUpdate',
    component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate.vue'),
    meta: { title: i18n.t('route.SystemUserUpdate'), activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'system-users/:id',
    name: 'SystemUserDetail',
    component: () => import('@/views/assets/SystemUser/SystemUserDetail/index.vue'),
    meta: { title: i18n.t('route.SystemUserDetail'), activeMenu: '/assets/system-users' },
    hidden: true
  },
  {
    path: 'cmd-filters',
    name: 'CommandFilterList',
    component: () => import('@/views/assets/CommandFilter/CommandFilterList.vue'),
    meta: { title: i18n.t('route.CommandFilterList'), activeMenu: '/assets/cmd-filters' }
  },
  {
    path: 'cmd-filters/:id/update',
    component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterUpdate',
    meta: { title: i18n.t('route.CommandFilterUpdate'), activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/create',
    component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterCreate',
    meta: { title: i18n.t('route.CommandFilterCreate'), activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'cmd-filters/:id',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/index.vue'), // Parent router-view
    name: 'CommandFilterDetail',
    meta: { title: i18n.t('route.CommandFilterDetail'), activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'command-filter-rules/create',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterRulesCreate',
    meta: { title: i18n.t('route.CommandFilterRulesCreate'), activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'command-filter-rules/:id/update',
    component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
    name: 'CommandFilterRulesUpdate',
    meta: { title: i18n.t('route.CommandFilterRulesUpdate'), activeMenu: '/assets/cmd-filters' },
    hidden: true
  },
  {
    path: 'platforms',
    name: 'PlatformList',
    component: () => import('@/views/assets/Platform/PlatformList'),
    meta: { title: i18n.t('route.PlatformList'), activeMenu: '/assets/platforms' }
  },
  {
    path: 'platforms/create',
    component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
    name: 'PlatformCreate',
    meta: { title: i18n.t('route.PlatformCreate'), activeMenu: '/assets/platforms' },
    hidden: true
  },
  {
    path: 'platforms/:id/update',
    component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
    name: 'PlatformUpdate',
    meta: { title: i18n.t('route.PlatformUpdate'), activeMenu: '/assets/platforms', permissions: [rolec.PERM_SUPER] },
    hidden: true
  },
  {
    path: 'platforms/:id',
    component: () => import('@/views/assets/Platform/PlatformDetail.vue'), // Parent router-view
    name: 'PlatformDetail',
    meta: { title: i18n.t('route.PlatformDetail'), activeMenu: '/assets/platforms' },
    hidden: true
  },
  {
    path: 'labels',
    name: 'LabelList',
    component: () => import('@/views/assets/Label/LabelList.vue'),
    meta: { title: i18n.t('route.LabelList'), activeMenu: '/assets/labels' }
  },
  {
    path: 'labels/create',
    name: 'LabelCreate',
    component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
    meta: { title: i18n.t('route.LabelCreate'), activeMenu: '/assets/labels' },
    hidden: true
  },
  {
    path: 'labels/:id/update',
    name: 'LabelUpdate',
    component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
    meta: { title: i18n.t('route.LabelUpdate'), activeMenu: '/assets/labels' }, hidden: true
  }
]
