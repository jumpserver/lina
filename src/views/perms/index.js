import Layout from '@/layout'
const PermsRoute = [
  {
    path: 'asset-permissions',
    name: 'AssetPermissionList',
    // component: () => import('@/views/perms/AssetPermissionList'),
    component: () => import('@/views/perms/AssetPermissionList/index'),
    meta: { title: 'AssetPermission' }
  },
  {
    path: 'asset-permissions/create',
    component: () => import('@/views/perms/AssetPermissionCreateUpdate'),
    name: 'AssetPermissionCreate',
    hidden: true,
    meta: { title: 'AssetPermissionCreate', activeMenu: '/perms/asset-permissions', action: 'create' }
  },
  {
    path: 'users/:id/update',
    component: () => import('@/views/perms/AssetPermissionCreateUpdate.vue'),
    name: 'AssetPermissionUpdate',
    hidden: true,
    meta: { title: 'AssetPermissionUpdate', activeMenu: '/perms/asset-permissions', action: 'update' }
  },
  {
    path: 'asset-permissions/:id',
    component: () => import('@/views/perms/AssetPermissionDetail/index'),
    name: 'AssetPermissionDetail',
    hidden: true,
    meta: { title: 'AssetPermissionDetail', activeMenu: '/perms/asset-permissions' }
  },
  {
    path: 'remote-app-permissions',
    name: 'RemoteAppPermissionList',
    component: () => import('@/views/perms/RemoteAppPermissionList'),
    meta: { title: 'RemoteAppPermission' }
  },
  {
    path: 'remote-app-permissions/create',
    component: () => import('@/views/perms/RemoteAppPermissionCreateUpdate'),
    name: 'RemoteAppPermissionCreate',
    hidden: true,
    meta: { title: 'RemoteAppPermissionCreate', activeMenu: '/perms/remote-app-permissions', action: 'create' }
  },
  {
    path: 'remote-app-permissions/update',
    component: () => import('@/views/perms/RemoteAppPermissionCreateUpdate'),
    name: 'RemoteAppPermissionUpdate',
    hidden: true,
    meta: { title: 'RemoteAppPermissionUpdate', activeMenu: '/perms/remote-app-permissions', action: 'update' }
  },
  {
    path: 'remote-app-permissions/:id',
    component: () => import('@/views/perms/RemoteAppPermissionDetail/index'),
    name: 'RemoteAppPermissionDetail',
    hidden: true,
    meta: { title: 'RemoteAppPermissionDetail', activeMenu: '/perms/remote-app-permissions' }
  },
  {
    path: 'database-app-permissions',
    name: 'DatabaseAppPermissionList',
    component: () => import('@/views/perms/DatabaseAppPermissionList'),
    meta: { title: 'DatabaseAppPermission' }
  },
  {
    path: 'database-app-permissions/create',
    component: () => import('@/views/perms/DatabaseAppPermissionCreateUpdate'), // Parent router-view
    name: 'DatabaseAppPermissionCreate',
    hidden: true,
    meta: { title: 'DatabaseAppPermissionCreate', activeMenu: '/perms/database-app-permissions' }
  },
  {
    path: 'database-app-permissions/update',
    component: () => import('@/views/perms/DatabaseAppPermissionCreateUpdate'), // Parent router-view
    name: 'DatabaseAppPermissionUpdate',
    hidden: true,
    meta: { title: 'DatabaseAppPermissionUpdate', activeMenu: '/perms/database-app-permissions', action: 'update' }
  },
  {
    path: 'database-app-permissions/:id',
    component: () => import('@/views/perms/DatabaseAppPermissionDetail/index'),
    name: 'DatabaseAppPermissionDetail',
    hidden: true,
    meta: { title: 'DatabaseAppPermissionDetail', activeMenu: '/perms/database-app-permissions' }
  }
]
export default {
  path: '/perms/',
  component: Layout,
  redirect: '/perms/asset-permissions/',
  name: 'Perms',
  meta: { title: 'Perms', icon: 'edit' },
  children: PermsRoute
}

