import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'remote-apps',
    redirect: '',
    component: empty,
    meta: {
      title: i18n.t('route.RemoteApp'),
      licenseRequired: true,
      app: 'applications',
      resource: 'application'
    },
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
        hidden: true,
        meta: { title: i18n.t('route.RemoteApp') }
      },
      {
        path: ':id/update',
        name: 'RemoteAppUpdate',
        component: () => import('@/views/applications/RemoteApp/RemoteAppCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.RemoteAppUpdate') }
      },
      {
        path: ':id',
        name: 'RemoteAppDetail',
        component: () => import('@/views/applications/RemoteApp/RemoteAppDetail'),
        hidden: true,
        meta: { title: i18n.t('route.RemoteAppDetail') }
      }
    ]
  },
  {
    path: 'databases',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.DatabaseApp'),
      resource: 'application'
    },
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
        hidden: true,
        meta: { title: i18n.t('route.DatabaseAppCreate') }
      },
      {
        path: ':id/update',
        name: 'DatabaseAppUpdate',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.DatabaseAppUpdate') }
      },
      {
        path: ':id',
        name: 'DatabaseAppDetail',
        component: () => import('@/views/applications/DatabaseApp/DatabaseAppDetail'),
        hidden: true,
        meta: { title: i18n.t('route.DatabaseAppDetail') }
      }
    ]
  },
  {
    path: 'kubernetes',
    component: empty,
    meta: {
      title: i18n.t('route.KubernetesApp'),
      resource: 'application'
    },
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
        hidden: true,
        meta: { title: i18n.t('route.KubernetesAppCreate') }
      },
      {
        path: ':id/update',
        name: 'KubernetesAppUpdate',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.KubernetesAppUpdate') }
      },
      {
        path: ':id',
        name: 'KubernetesAppDetail',
        component: () => import('@/views/applications/KubernetesApp/KubernetesAppDetail'),
        hidden: true,
        meta: { title: i18n.t('route.KubernetesAppDetail') }
      }
    ]
  }
]
