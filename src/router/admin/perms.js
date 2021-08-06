import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'asset-permissions',
    name: 'AssetPermissionList',
    component: empty,
    meta: { title: i18n.t('route.AssetPermission') },
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
        meta: { title: i18n.t('route.AssetPermissionCreate'), hidden: true, action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
        name: 'AssetPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionUpdate'), hidden: true, action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail'),
        name: 'AssetPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionDetail'), hidden: true }
      }
    ]
  },
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
        meta: { title: i18n.t('route.ApplicationPermission') }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionCreate',
        meta: { title: i18n.t('route.ApplicationPermissionCreate'), hidden: true, action: 'create' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionDetail'),
        name: 'ApplicationPermissionDetail',
        meta: { title: i18n.t('route.ApplicationPermissionDetail'), hidden: true }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/ApplicationPermission/ApplicationPermissionCreateUpdate'),
        name: 'ApplicationPermissionUpdate',
        meta: { title: i18n.t('route.ApplicationPermissionUpdate'), hidden: true, action: 'update' }
      }
    ]
  }
]
