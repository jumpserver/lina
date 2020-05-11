export default [
  {
    path: 'remote-apps',
    name: 'RemoteAppList',
    component: () => import('@/views/applications/RemoteApp/RemoteAppList'),
    meta: { title: 'RemoteApp' }
  },
  {
    path: 'remote-apps/create',
    name: 'RemoteAppCreate',
    component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
    meta: { title: 'RemoteApp' },
    hidden: true
  },
  {
    path: 'remote-apps/:id',
    name: 'RemoteAppDetail',
    component: () => import('@/views/applications/RemoteApp/RemoteAppList'),
    meta: { title: 'RemoteApp' },
    hidden: true
  },
  {
    path: 'database-apps',
    name: 'DatabaseAppList',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppList'),
    meta: { title: 'DatabaseApp' }
  },
  {
    path: 'database-apps/create',
    name: 'DatabaseAppCreate',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
    meta: { title: 'DatabaseAppCreate', activeMenu: '/applications/database-apps', action: 'create' },
    hidden: true
  },
  {
    path: 'database-apps/:id/update',
    name: 'DatabaseAppUpdate',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
    meta: { title: 'DatabaseAppUpdate', activeMenu: '/applications/database-apps', action: 'update' },
    hidden: true
  },
  {
    path: 'database-apps/:id',
    name: 'DatabaseAppDetail',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppDetail/index'),
    meta: { title: 'DatabaseAppDetail', activeMenu: '/applications/database-apps', action: 'update' },
    hidden: true
  }
]
