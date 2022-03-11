import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

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
  {
    path: 'application-permissions',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.ApplicationPermission'),
      resource: 'applicationpermission'
    },
    children: [
      {
        path: '',
        name: 'ApplicationPermissionList',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionList'),
        meta: {
          title: i18n.t('route.ApplicationPermission')
        }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionCreate',
        hidden: true,
        meta: {
          title: i18n.t('route.ApplicationPermissionCreate'),
          action: 'create'
        }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionDetail'),
        name: 'ApplicationPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.ApplicationPermissionDetail') }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.ApplicationPermissionUpdate'), action: 'update' }
      }
    ]
  }
]
