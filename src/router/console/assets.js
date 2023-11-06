import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import XPackRoutes from './xpack'

export default [
  {
    path: 'assets',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.AssetList'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: '',
        name: 'AssetList',
        component: () => import('@/views/assets/Asset/AssetList/index.vue'),
        meta: { title: i18n.t('route.AssetList') }
      },
      {
        path: ':id',
        name: 'AssetDetail',
        component: () => import('@/views/assets/Asset/AssetDetail'),
        hidden: true,
        meta: { title: i18n.t('route.AssetDetail') }
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
    path: 'hosts',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.HostList'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'HostCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'HostUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'databases',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.Databases'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'DatabaseCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.DatabaseCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DatabaseUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.DatabaseUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'devices',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.devices'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'DeviceCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.DeviceCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DeviceUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.DeviceUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'clouds',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.networking'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'CloudCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.CloudCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'CloudUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.CloudUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'webs',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.networking'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'WebCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.WebCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'WebUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.WebUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'gpts',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.gpts'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'GptCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/GPTCreateUpdate.vue'),
        meta: { title: i18n.t('route.GPTCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'GptUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/GPTCreateUpdate.vue'),
        meta: { title: i18n.t('route.GPTUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'customs',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('route.CustomAsset'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'CustomCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.CustomCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'CustomUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.CustomUpdate'), activeMenu: '/console/assets/assets' }
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
        component: () => import('@/views/assets/Platform/PlatformDetail'), // Parent router-view
        name: 'PlatformDetail',
        hidden: true,
        meta: { title: i18n.t('route.PlatformDetail') }
      }
    ]
  },
  ...XPackRoutes
]
