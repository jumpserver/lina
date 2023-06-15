import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import ACLRoutes from '@/router/console/acls'

export default [
  {
    path: 'asset-permissions',
    component: empty,
    meta: {
      title: i18n.t('route.AssetPermission'),
      resource: 'assetpermission'
    },
    children: [
      {
        path: '',
        name: 'AssetPermissionList',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionList'),
        meta: { title: i18n.t('route.AssetPermission') }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate'),
        name: 'AssetPermissionCreate',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionCreate'), action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
        name: 'AssetPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionUpdate'), action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail'),
        name: 'AssetPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionDetail') }
      }
    ]
  },
  ...ACLRoutes
]
