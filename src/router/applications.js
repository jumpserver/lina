import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'remote-apps',
    redirect: '',
    component: empty,
    meta: { title: i18n.t('route.RemoteApp'), licenseRequired: true },
    children: [
      {
        path: '',
        name: 'RemoteAppList',
        meta: { title: i18n.t('route.RemoteApp'), activeMenu: '/applications/remote-apps' },
        component: () => import('@/views/applications/RemoteApp/RemoteAppList')
      },
      {
        path: 'create',
        name: 'RemoteAppCreate',
        component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
        meta: { title: i18n.t('route.RemoteApp'), activeMenu: '/applications/remote-apps', action: 'create' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'RemoteAppUpdate',
        component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
        meta: { title: i18n.t('route.RemoteAppUpdate'), activeMenu: '/applications/remote-apps', action: 'update' },
        hidden: true
      },
      {
        path: ':id',
        name: 'RemoteAppDetail',
        component: () => import('@/views/applications/RemoteApp/RemoteAppDetail/index'),
        meta: { title: i18n.t('route.RemoteAppDetail'), activeMenu: '/applications/remote-apps' },
        hidden: true
      }
    ]
  },
  {
    path: 'database-apps',
    name: 'DatabaseAppList',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppList'),
    meta: { title: i18n.t('route.DatabaseApp') }
  },
  {
    path: 'database-apps/create',
    name: 'DatabaseAppCreate',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
    meta: { title: i18n.t('route.DatabaseAppCreate'), activeMenu: '/applications/database-apps', action: 'create' },
    hidden: true
  },
  {
    path: 'database-apps/:id/update',
    name: 'DatabaseAppUpdate',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
    meta: { title: i18n.t('route.DatabaseAppUpdate'), activeMenu: '/applications/database-apps', action: 'update' },
    hidden: true
  },
  {
    path: 'database-apps/:id',
    name: 'DatabaseAppDetail',
    component: () => import('@/views/applications/DatabaseApp/DatabaseAppDetail/index'),
    meta: { title: i18n.t('route.DatabaseAppDetail'), activeMenu: '/applications/database-apps' },
    hidden: true
  },
  {
    path: 'kubernetes-apps',
    name: 'KubernetesAppList',
    component: () => import('@/views/applications/KubernetesApp/KubernetesAppList'),
    meta: { title: i18n.t('route.KubernetesApp') }
  },
  {
    path: 'kubernetes-apps/create',
    name: 'KubernetesAppCreate',
    component: () => import('@/views/applications/KubernetesApp/KubernetesAppCreateUpdate'),
    meta: { title: i18n.t('route.KubernetesAppCreate'), activeMenu: '/applications/kubernetes-apps', action: 'create' },
    hidden: true
  },
  {
    path: 'kubernetes-apps/:id/update',
    name: 'KubernetesAppUpdate',
    component: () => import('@/views/applications/KubernetesApp/KubernetesAppCreateUpdate'),
    meta: { title: i18n.t('route.KubernetesAppUpdate'), activeMenu: '/applications/kubernetes-apps', action: 'update' },
    hidden: true
  },
  {
    path: 'kubernetes-apps/:id',
    name: 'KubernetesAppDetail',
    component: () => import('@/views/applications/KubernetesApp/KubernetesAppDetail/index'),
    meta: { title: i18n.t('route.KubernetesAppDetail'), activeMenu: '/applications/kubernetes-apps' },
    hidden: true
  }
]
