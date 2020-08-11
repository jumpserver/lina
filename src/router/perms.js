import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const assetPermissionRoutes = [
  {
    path: 'asset-permissions',
    name: 'AssetPermissionList',
    component: () => import('@/views/perms/AssetPermission/AssetPermissionList'),
    meta: { title: i18n.t('route.AssetPermission') }
  },
  {
    path: 'asset-permissions/create',
    component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate'),
    name: 'AssetPermissionCreate',
    hidden: true,
    meta: { title: i18n.t('route.AssetPermissionCreate'), activeMenu: '/perms/asset-permissions', action: 'create' }
  },
  {
    path: 'asset-permission/:id/update',
    component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
    name: 'AssetPermissionUpdate',
    hidden: true,
    meta: { title: i18n.t('route.AssetPermissionUpdate'), activeMenu: '/perms/asset-permissions', action: 'update' }
  },
  {
    path: 'asset-permissions/:id',
    component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail/index'),
    name: 'AssetPermissionDetail',
    hidden: true,
    meta: { title: i18n.t('route.AssetPermissionDetail'), activeMenu: '/perms/asset-permissions' }
  }
]

const remoteAppPermissionRoutes = [
  {
    path: 'remote-app-permissions',
    component: empty,
    meta: { title: i18n.t('route.RemoteAppPermission'), licenseRequired: true },
    redirect: '',
    children: [
      {
        path: '',
        name: 'RemoteAppPermissionList',
        component: () => import('@/views/perms/RemoteAppPermission/RemoteAppPermissionList'),
        meta: { title: i18n.t('route.RemoteAppPermission'), activeMenu: '/perms/remote-app-permissions' }

      },
      {
        path: 'create',
        component: () => import('@/views/perms/RemoteAppPermission/RemoteAppPermissionCreateUpdate'),
        name: 'RemoteAppPermissionCreate',
        hidden: true,
        meta: { title: i18n.t('route.RemoteAppPermissionCreate'), activeMenu: '/perms/remote-app-permissions', action: 'create' }
      },
      {
        path: 'update',
        component: () => import('@/views/perms/RemoteAppPermission/RemoteAppPermissionCreateUpdate'),
        name: 'RemoteAppPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.RemoteAppPermissionUpdate'), activeMenu: '/perms/remote-app-permissions', action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/RemoteAppPermission/RemoteAppPermissionDetail/index'),
        name: 'RemoteAppPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.RemoteAppPermissionDetail'), activeMenu: '/perms/remote-app-permissions' }
      }]
  }

]

const databasePermissionRoutes = [
  {
    path: 'database-app-permissions',
    name: 'DatabaseAppPermissionList',
    component: () => import('@/views/perms/DatabaseAppPermission/DatabaseAppPermissionList'),
    meta: { title: i18n.t('route.DatabaseAppPermission') }
  },
  {
    path: 'database-app-permissions/create',
    component: () => import('@/views/perms/DatabaseAppPermission/DatabaseAppPermissionCreateUpdate'), // Parent router-view
    name: 'DatabaseAppPermissionCreate',
    hidden: true,
    meta: { title: i18n.t('route.DatabaseAppPermissionCreate'), activeMenu: '/perms/database-app-permissions' }
  },
  {
    path: 'database-app-permissions/update',
    component: () => import('@/views/perms/DatabaseAppPermission/DatabaseAppPermissionCreateUpdate'), // Parent router-view
    name: 'DatabaseAppPermissionUpdate',
    hidden: true,
    meta: { title: i18n.t('route.DatabaseAppPermissionUpdate'), activeMenu: '/perms/database-app-permissions', action: 'update' }
  },
  {
    path: 'database-app-permissions/:id',
    component: () => import('@/views/perms/DatabaseAppPermission/DatabaseAppPermissionDetail/index'),
    name: 'DatabaseAppPermissionDetail',
    hidden: true,
    meta: { title: i18n.t('route.DatabaseAppPermissionDetail'), activeMenu: '/perms/database-app-permissions' }
  }
]

const kubernetesPermissionRoutes = [
  {
    path: 'kubernetes-app-permissions',
    name: 'KubernetesAppPermissionList',
    component: () => import('@/views/perms/KubernetesAppPermission/KubernetesAppPermissionList'),
    meta: { title: i18n.t('route.KubernetesAppPermission') }
  },
  {
    path: 'kubernetes-app-permissions/create',
    component: () => import('@/views/perms/KubernetesAppPermission/KubernetesAppPermissionCreateUpdate'), // Parent router-view
    name: 'KubernetesAppPermissionCreate',
    hidden: true,
    meta: { title: i18n.t('route.KubernetesAppPermissionCreate'), activeMenu: '/perms/kubernetes-app-permissions' }
  },
  {
    path: 'kubernetes-app-permissions/update',
    component: () => import('@/views/perms/KubernetesAppPermission/KubernetesAppPermissionCreateUpdate'), // Parent router-view
    name: 'KubernetesAppPermissionUpdate',
    hidden: true,
    meta: { title: i18n.t('route.KubernetesAppPermissionUpdate'), activeMenu: '/perms/kubernetes-app-permissions', action: 'update' }
  },
  {
    path: 'kubernetes-app-permissions/:id',
    component: () => import('@/views/perms/KubernetesAppPermission/KubernetesAppPermissionDetail/index'),
    name: 'KubernetesAppPermissionDetail',
    hidden: true,
    meta: { title: i18n.t('route.KubernetesAppPermissionDetail'), activeMenu: '/perms/kubernetes-app-permissions' }
  }
]
export default [
  ... assetPermissionRoutes,
  ... remoteAppPermissionRoutes,
  ... databasePermissionRoutes,
  ... kubernetesPermissionRoutes
]
