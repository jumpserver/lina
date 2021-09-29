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
        meta: { title: i18n.t('route.RemoteApp') },
        component: () => import('@/views/applications/RemoteApp/RemoteAppList')
      },
      {
        path: 'create',
        name: 'RemoteAppCreate',
        component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
        meta: { title: i18n.t('route.RemoteApp'), action: 'create', hidden: true }
      },
      {
        path: ':id/update',
        name: 'RemoteAppUpdate',
        component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
        meta: { title: i18n.t('route.RemoteAppUpdate'), action: 'update', hidden: true }
      },
      {
        path: ':id',
        name: 'RemoteAppDetail',
        component: () => import('@/views/applications/RemoteApp/RemoteAppDetail'),
        meta: { title: i18n.t('route.RemoteAppDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'databases',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.DatabaseApp') },
    children: [
      {
        path: '',
        name: 'DatabaseAppList',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppList'),
        meta: { title: i18n.t('route.DatabaseApp') }
      },
      {
        path: 'create',
        name: 'DatabaseAppCreate',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
        meta: { title: i18n.t('route.DatabaseAppCreate'), action: 'create', hidden: true }
      },
      {
        path: ':id/update',
        name: 'DatabaseAppUpdate',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
        meta: { title: i18n.t('route.DatabaseAppUpdate'), action: 'update', hidden: true }
      },
      {
        path: ':id',
        name: 'DatabaseAppDetail',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppDetail'),
        meta: { title: i18n.t('route.DatabaseAppDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'kubernetes',
    component: empty,
    meta: { title: i18n.t('route.KubernetesApp') },
    children: [
      {
        path: '',
        name: 'KubernetesAppList',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppList'),
        meta: { title: i18n.t('route.KubernetesApp') }
      },
      {
        path: 'create',
        name: 'KubernetesAppCreate',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppCreateUpdate'),
        meta: { title: i18n.t('route.KubernetesAppCreate'), action: 'create', hidden: true }
      },
      {
        path: ':id/update',
        name: 'KubernetesAppUpdate',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppCreateUpdate'),
        meta: { title: i18n.t('route.KubernetesAppUpdate'), action: 'update', hidden: true }
      },
      {
        path: ':id',
        name: 'KubernetesAppDetail',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppDetail'),
        meta: { title: i18n.t('route.KubernetesAppDetail'), hidden: true }
      }
    ]
  }
]
