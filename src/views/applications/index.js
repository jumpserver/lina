export default [
  {
    path: 'remote-apps',
    name: 'RemoteAppList',
    component: () => import('@/views/applications/RemoteAppList'),
    meta: { title: 'RemoteApp' }
  },
  {
    path: 'remote-apps/:id',
    name: 'RemoteAppDetail',
    component: () => import('@/views/applications/RemoteAppList'),
    meta: { title: 'RemoteApp' }
  },
  {
    path: 'database-apps',
    name: 'DatabaseAppList',
    component: () => import('@/views/applications/DatabaseAppList'),
    meta: { title: 'DatabaseApp' }
  }
]
