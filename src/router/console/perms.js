import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'asset-permissions',
    component: empty,
    meta: {
      title: i18n.t('AssetPermission'),
      resource: 'assetpermission'
    },
    children: [
      {
        path: '',
        name: 'AssetPermissionList',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionList'),
        meta: { title: i18n.t('AssetPermission'), permissions: ['perms.view_assetpermission'] }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate'),
        name: 'AssetPermissionCreate',
        hidden: true,
        meta: { title: i18n.t('AssetPermissionCreate'), action: 'create', permissions: ['perms.add_assetpermission'] }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
        name: 'AssetPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('AssetPermissionUpdate'), action: 'update', permissions: ['perms.change_assetpermission'] }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail'),
        name: 'AssetPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('AssetPermissionDetail'), permissions: ['perms.view_assetpermission'] }
      }
    ]
  }
]
