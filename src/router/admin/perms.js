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
    component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail'),
    name: 'AssetPermissionDetail',
    hidden: true,
    meta: { title: i18n.t('route.AssetPermissionDetail'), activeMenu: '/perms/asset-permissions' }
  }
]

const ApplicationPermissionRoutes = [
  {
    path: 'app-permissions',
    component: empty,
    meta: { title: i18n.t('route.ApplicationPermission') },
    redirect: '',
    children: [
      {
        path: '',
        name: 'ApplicationPermissionList',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionList'),
        meta: { title: i18n.t('route.ApplicationPermission'), activeMenu: '/perms/app-permissions' }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionCreate',
        hidden: true,
        meta: { title: i18n.t('route.ApplicationPermissionCreate'), activeMenu: '/perms/app-permissions', action: 'create' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionDetail'),
        name: 'ApplicationPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.ApplicationPermissionDetail'), activeMenu: '/perms/app-permissions' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.ApplicationPermissionUpdate'), activeMenu: '/perms/app-permissions', action: 'update' }
      }]
  }

]

export default [
  ... assetPermissionRoutes,
  ... ApplicationPermissionRoutes
]
