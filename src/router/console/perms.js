import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import ACLsMenus from './acls'
import { createViewSetRoutes } from '../viewset'

export default [
  {
    path: 'asset-permissions',
    component: empty,
    redirect: {
      name: 'AssetPermissionList'
    },
    meta: {
      title: i18n.t('BaseAssetPermission'),
      resource: 'assetpermission',
      icon: 'permission'
    },
    children: createViewSetRoutes({
      name: 'AssetPermission',
      list: () => import('@/views/perms/AssetPermission/AssetPermissionList'),
      form: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
      detail: () => import('@/views/perms/AssetPermission/AssetPermissionDetail/index.vue'),
      meta: {
        list: { title: i18n.t('AssetPermission'), permissions: ['perms.view_assetpermission'] },
        create: { permissions: ['perms.add_assetpermission'] },
        update: { permissions: ['perms.change_assetpermission'] },
        detail: { permissions: ['perms.view_assetpermission'] }
      }
    })
  },
  ...ACLsMenus
]
