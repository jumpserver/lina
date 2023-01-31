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
        path: '',
        name: 'HostList',
        component: () => import('@/views/assets/Asset/AssetList/HostList.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostList'), activeMenu: '/console/assets/assets' }
      },
      {
        path: 'create',
        name: 'HostCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('assets.CreateHost'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'HostUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/console/assets/assets' }
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
        path: '',
        name: 'DatabaseList',
        component: () => import('@/views/assets/Asset/AssetList/DatabaseList.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostList'), activeMenu: '/console/assets/assets' }
      },
      {
        path: 'create',
        name: 'DatabaseCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('assets.CreateDatabase'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DatabaseUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/console/assets/assets' }
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
        path: '',
        name: 'DeviceList',
        component: () => import('@/views/assets/Asset/AssetList/DeviceList.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostList'), activeMenu: '/console/assets/assets' }
      },
      {
        path: 'create',
        name: 'DeviceCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('assets.CreateDevice'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'DeviceUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/console/assets/assets' }
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
        path: '',
        name: 'CloudsPlatformList',
        component: () => import('@/views/assets/Asset/AssetList/CloudList.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostList'), activeMenu: '/console/assets/assets' }
      },
      {
        path: 'create',
        name: 'CloudCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('assets.CreateCloud'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'CloudUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/console/assets/assets' }
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
        path: '',
        name: 'WebList',
        component: () => import('@/views/assets/Asset/AssetList/WebList.vue'),
        hidden: true,
        meta: { title: i18n.t('route.HostList'), activeMenu: '/console/assets/assets' }
      },
      {
        path: 'create',
        name: 'WebCreate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('assets.CreateWeb'), activeMenu: '/console/assets/assets' }
      },
      {
        path: ':id/update',
        name: 'WebUpdate',
        component: () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetUpdate'), activeMenu: '/console/assets/assets' }
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
