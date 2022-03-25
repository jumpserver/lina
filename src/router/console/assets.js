import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import XPackRoutes from './xpack'

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
        hidden: true,
        meta: { title: i18n.t('route.AssetCreate') }
      },
      {
        path: ':id',
        name: 'AssetDetail',
        component: () => import('@/views/assets/Asset/AssetDetail'),
        hidden: true,
        meta: { title: i18n.t('route.AssetDetail') }
      },
      {
        path: ':id/update',
        name: 'AssetUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate') }
      },
      {
        path: 'detail/:id/update',
        name: 'AssetMoreInformationEdit',
        component: () => import('@/views/assets/Asset/AssetMoreInformationEdit.vue'),
        hidden: true,
        meta: { title: i18n.t('common.UpdateAssetDetail'), action: 'update' }
      }
    ]
  },
  {
    path: 'domains',
    component: empty,
    redirect: '',
    meta: {
      permissions: ['assets.view_domain']
    },
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
        hidden: true,
        meta: { title: i18n.t('route.DomainCreate') }
      },
      {
        path: ':id/update',
        name: 'DomainUpdate',
        component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.DomainUpdate') }
      },
      {
        path: ':id',
        name: 'DomainDetail',
        component: () => import('@/views/assets/Domain/DomainDetail'),
        hidden: true,
        meta: { title: i18n.t('route.DomainDetail') }
      }
    ]
  },
  {
    path: 'gateways',
    component: empty,
    redirect: 'create',
    hidden: true,
    meta: {
      permissions: ['assets.view_gateway']
    },
    children: [
      {
        path: 'create',
        name: 'GatewayCreate',
        component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
        meta: {
          title: i18n.t('route.GatewayCreate'),
          permissions: ['assets.view_gateway']
        }
      },
      {
        path: ':id/update',
        name: 'GatewayUpdate',
        component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
        meta: {
          title: i18n.t('route.GatewayUpdate'),
          permissions: ['assets.change_gateway']
        }
      }
    ]
  },
  {
    path: 'system-users',
    component: empty,
    redirect: '',
    meta: {
      permissions: ['assets.view_systemuser']
    },
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
        hidden: true,
        meta: { title: i18n.t('route.SystemUserCreate') }
      },
      {
        path: ':id/update',
        name: 'SystemUserUpdate',
        component: () => import('@/views/assets/SystemUser/SystemUserCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.SystemUserUpdate') }
      },
      {
        path: ':id',
        name: 'SystemUserDetail',
        component: () => import('@/views/assets/SystemUser/SystemUserDetail'),
        hidden: true,
        meta: { title: i18n.t('route.SystemUserDetail') }
      }
    ]
  },
  {
    path: 'cmd-filters',
    component: empty,
    redirect: '',
    meta: {
      resource: 'commandfilter',
      permissions: ['assets.view_commandfilter']
    },
    children: [
      {
        path: '',
        name: 'CommandFilterList',
        component: () => import('@/views/assets/CommandFilter/CommandFilterList.vue'),
        meta: { title: i18n.t('route.CommandFilterList') }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterUpdate',
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterUpdate') }
      },
      {
        path: 'create',
        component: () => import('@/views/assets/CommandFilter/CommandFilterCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterCreate',
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterCreate') }
      },
      {
        path: ':id',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail'), // Parent router-view
        name: 'CommandFilterDetail',
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterDetail') }
      }
    ]
  },
  {
    path: 'command-filter-rules',
    component: empty,
    hidden: true,
    meta: {
      resource: 'commandfilterrule'
    },
    children: [
      {
        path: 'create',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterRulesCreate',
        meta: {
          title: i18n.t('route.CommandFilterRulesCreate'),
          activeMenu: '/console/assets/cmd-filters'
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/CommandFilter/CommandFilterDetail/RulesCreateUpdate.vue'), // Parent router-view
        name: 'CommandFilterRulesUpdate',
        meta: {
          title: i18n.t('route.CommandFilterRulesUpdate'),
          activeMenu: '/console/assets/cmd-filters'
        }
      }
    ]
  },
  {
    path: 'platforms',
    component: empty,
    meta: {
      permissions: ['assets.view_platform'],
      resource: 'platform'
    },
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
        hidden: true,
        meta: { title: i18n.t('route.PlatformCreate') }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
        name: 'PlatformUpdate',
        hidden: true,
        meta: { title: i18n.t('route.PlatformUpdate'), permissions: [] }
      },
      {
        path: ':id',
        component: () => import('@/views/assets/Platform/PlatformDetail.vue'), // Parent router-view
        name: 'PlatformDetail',
        hidden: true,
        meta: { title: i18n.t('route.PlatformDetail') }
      }
    ]
  },
  {
    path: 'labels',
    component: empty,
    redirect: '',
    meta: {
      resource: 'label',
      permissions: ['assets.view_label']
    },
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
        hidden: true,
        meta: { title: i18n.t('route.LabelCreate') }
      },
      {
        path: ':id/update',
        name: 'LabelUpdate',
        component: () => import('@/views/assets/Label/LabelCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.LabelUpdate') }
      }
    ]
  },
  ...XPackRoutes
]
