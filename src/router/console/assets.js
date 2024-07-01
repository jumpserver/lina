import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import XPackRoutes from './xpack'

const globalSubmenu = () => import('@/layout/globalOrg.vue')
export default [
  {
    path: 'assets',
    component: empty,
    redirect: {
      name: 'AssetList'
    },
    meta: {
      title: i18n.t('BaseAssetList'),
      app: 'assets',
      resource: 'asset',
      icon: 'assets'
    },
    children: [
      {
        path: '',
        name: 'AssetList',
        component: () => import('@/views/assets/Asset/AssetList/index.vue'),
        meta: { title: i18n.t('AssetList') }
      },
      {
        path: ':id',
        name: 'AssetDetail',
        component: () => import('@/views/assets/Asset/AssetDetail'),
        hidden: true,
        meta: { title: i18n.t('AssetDetail') }
      },
      {
        path: 'detail/:id/update',
        name: 'AssetMoreInformationEdit',
        component: () => import('@/views/assets/Asset/AssetMoreInformationEdit.vue'),
        hidden: true,
        meta: { title: i18n.t('UpdateAssetDetail'), action: 'update' }
      }
    ]
  },
  {
    path: 'hosts',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('HostList'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'HostCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('HostCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'HostUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('HostUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'databases',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('Databases'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'DatabaseCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('DatabaseCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DatabaseUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('DatabaseUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'devices',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('devices'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'DeviceCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('DeviceCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DeviceUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('DeviceUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'clouds',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'CloudCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('CloudCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'CloudUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('CloudUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'webs',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'WebCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('WebCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'WebUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('WebUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'gpts',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('gpts'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'GptCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/GPTCreateUpdate.vue'),
        meta: { title: i18n.t('GPTCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'GptUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/GPTCreateUpdate.vue'),
        meta: { title: i18n.t('GPTUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'customs',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('CustomAsset'),
      app: 'assets',
      resource: 'asset'
    },
    children: [
      {
        path: 'create',
        name: 'CustomCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('CustomCreate'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'CustomUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('CustomUpdate'), activeMenu: '/console/assets/assets' }
      }
    ]
  },
  {
    path: 'zones',
    component: empty,
    redirect: '',
    meta: {
      resource: 'domain',
      icon: 'zone',
      permissions: ['assets.view_domain']
    },
    children: [
      {
        path: '',
        name: 'ZoneList',
        component: () => import('@/views/assets/Domain/DomainList.vue'),
        meta: { title: i18n.t('ZoneList') }
      },
      {
        path: 'create',
        name: 'ZoneCreate',
        component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('ZoneCreate') }
      },
      {
        path: ':id/update',
        name: 'ZoneUpdate',
        component: () => import('@/views/assets/Domain/DomainCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('ZoneUpdate') }
      },
      {
        path: ':id',
        name: 'ZoneDetail',
        component: () => import('@/views/assets/Domain/DomainDetail'),
        hidden: true,
        meta: { title: i18n.t('Zone') }
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
          title: i18n.t('GatewayCreate'),
          permissions: ['assets.view_gateway']
        }
      },
      {
        path: ':id/update',
        name: 'GatewayUpdate',
        component: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
        meta: {
          title: i18n.t('GatewayUpdate'),
          permissions: ['assets.change_gateway']
        }
      }
    ]
  },
  {
    path: 'platforms',
    component: globalSubmenu,
    meta: {
      permissions: ['assets.view_platform'],
      resource: 'platform',
      icon: 'platform',
      disableOrgsChange: true
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'PlatformList',
        component: () => import('@/views/assets/Platform/PlatformList'),
        meta: { title: i18n.t('PlatformList') }
      },
      {
        path: 'create',
        component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
        name: 'PlatformCreate',
        hidden: true,
        meta: { title: i18n.t('PlatformCreate') }
      },
      {
        path: ':id/update',
        component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
        name: 'PlatformUpdate',
        hidden: true,
        meta: { title: i18n.t('PlatformUpdate'), permissions: [] }
      },
      {
        path: ':id',
        component: () => import('@/views/assets/Platform/PlatformDetail'), // Parent router-view
        name: 'PlatformDetail',
        hidden: true,
        meta: { title: i18n.t('PlatformDetail') }
      }
    ]
  },
  ...XPackRoutes
]
