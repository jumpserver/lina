import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'assets',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.AssetList'), permissions: ['assets.view_asset'] },
    children: [
      {
        path: '',
        name: 'AssetList',
        component: () => import('@/views/assets/Asset/AssetList.vue'),
        meta: { title: i18n.t('route.AssetList') }
      },
      {
        path: 'create',
        name: 'AssetCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate.vue'),
        meta: { title: i18n.t('route.AssetCreate'), hidden: true }
      },
      {
        path: ':id',
        name: 'AssetDetail',
        component: () => import('@/views/assets/Asset/AssetDetail'),
        meta: { title: i18n.t('route.AssetDetail'), hidden: true }
      },
      {
        path: ':id/update',
        name: 'AssetUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate.vue'),
        meta: { title: i18n.t('route.AssetUpdate'), hidden: true }
      },
      {
        path: 'detail/:id/update',
        name: 'AssetMoreInformationEdit',
        component: () => import('@/views/assets/Asset/AssetMoreInformationEdit.vue'),
        meta: { title: i18n.t('common.UpdateAssetDetail'), hidden: true, action: 'update' }
      }
    ]
  },
  {
    path: 'domains',
    component: empty,
    redirect: '',
    meta: { },
    children: [
      {
        path: '',
        name: 'DomainList',
        component: () => import('@/views/assets/Domain/DomainList.vue'),
        meta: { title: i18n.t('route.DomainList') }
      },
      {
        path: 'create',
        name: 'DomainCreate',
        component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
        meta: { title: i18n.t('route.DomainCreate'), hidden: true }
      },
      {
        path: ':id/update',
        name: 'DomainUpdate',
        component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
        meta: { title: i18n.t('route.DomainUpdate'), hidden: true },
        hidden: true
      },
      {
        path: ':id',
        name: 'DomainDetail',
        component: () => import('@/views/assets/Domain/DomainDetail'),
        meta: { title: i18n.t('route.DomainDetail'), hidden: true },
        hidden: true
      }
    ]
  },
  {
    path: 'gateways',
    component: empty,
    redirect: 'create',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'create',
        name: 'GatewayCreate',
        component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
        meta: { title: i18n.t('route.GatewayCreate'), activeMenu: '/admin/assets/domains', hidden: true, permissions: ['assets.view_gateway'] }
      },
      {
        path: ':id/update',
        name: 'GatewayUpdate',
        component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
        meta: { title: i18n.t('route.GatewayUpdate'), activeMenu: '/admin/assets/domains', hidden: true, permissions: ['assets.change_gateway'] }
      }
    ]
  },
  {
    path: 'system-users',
    component: empty,
    redirect: '',
    meta: { },
    children: [
      {
        path: '',
        name: 'SystemUserList',
        component: () => import('@/views/assets/SystemUser/SystemUserList'),
        meta: { title: i18n.t('route.SystemUserList') }
      },
      {
        path: 'create',
        name: 'SystemUserCreate',
        component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate'),
        meta: { title: i18n.t('route.SystemUserCreate'), hidden: true }
      },
      {
        path: ':id/update',
        name: 'SystemUserUpdate',
        component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate'),
        meta: { title: i18n.t('route.SystemUserUpdate'), hidden: true }
      },
      {
        path: ':id',
        name: 'SystemUserDetail',
        component: () => import('@/views/assets/SystemUser/SystemUserDetail'),
        meta: { title: i18n.t('route.SystemUserDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'command-filters',
    component: empty,
    redirect: '',
    meta: { },
    children: [
      {
        path: '',
        name: 'CommandFilterList',
        component: () => import('@/views/assets/CommandFilter/CommandFilterList.vue'),
        meta: { title: i18n.t('route.CommandFilterList'), activeMenu: 'CommandFilterList' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterUpdate',
        meta: { title: i18n.t('route.CommandFilterUpdate'), hidden: true }
      },
      {
        path: 'create',
        component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterCreate',
        meta: { title: i18n.t('route.CommandFilterCreate'), hidden: true }
      },
      {
        path: ':id',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail'), // Parent router-view
        name: 'CommandFilterDetail',
        meta: { title: i18n.t('route.CommandFilterDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'command-filter-rules',
    component: empty,
    meta: { hidden: true },
    children: [
      {
        path: 'create',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterRulesCreate',
        meta: { title: i18n.t('route.CommandFilterRulesCreate'), activeMenu: '/admin/assets/cmd-filters', hidden: true }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterRulesUpdate',
        meta: { title: i18n.t('route.CommandFilterRulesUpdate'), activeMenu: '/admin/assets/cmd-filters', hidden: true }

      }
    ]
  },
  {
    path: 'platforms',
    component: empty,
    meta: { permissions: [] },
    redirect: '',
    children: [
      {
        path: '',
        name: 'PlatformList',
        component: () => import('@/views/assets/Platform/PlatformList'),
        meta: { title: i18n.t('route.PlatformList') }
      },
      {
        path: 'create',
        component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
        name: 'PlatformCreate',
        meta: { title: i18n.t('route.PlatformCreate'), hidden: true }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
        name: 'PlatformUpdate',
        meta: { title: i18n.t('route.PlatformUpdate'), permissions: [], hidden: true }
      },
      {
        path: ':id',
        component: () => import('@/views/assets/Platform/PlatformDetail.vue'), // Parent router-view
        name: 'PlatformDetail',
        meta: { title: i18n.t('route.PlatformDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'labels',
    component: empty,
    redirect: '',
    meta: { },
    children: [
      {
        path: '',
        name: 'LabelList',
        component: () => import('@/views/assets/Label/LabelList.vue'),
        meta: { title: i18n.t('route.LabelList') }
      },
      {
        path: 'create',
        name: 'LabelCreate',
        component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
        meta: { title: i18n.t('route.LabelCreate'), hidden: true }
      },
      {
        path: ':id/update',
        name: 'LabelUpdate',
        component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
        meta: { title: i18n.t('route.LabelUpdate'), hidden: true }
      }
    ]
  }

]
