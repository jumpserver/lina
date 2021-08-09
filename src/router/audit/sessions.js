import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default [
  {
    path: 'sessions',
    name: 'SessionList',
    component: () => import('@/views/sessions/SessionList'),
    meta: { title: i18n.t('route.Sessions'), permissions: [rolec.PERM_AUDIT] },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList'),
        meta: { title: i18n.t('route.Sessions') }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail'),
        meta: { title: i18n.t('route.SessionDetail'), hidden: true }
      }
    ]
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: { title: i18n.t('route.Commands'), permissions: [rolec.PERM_AUDIT] }
  }
]
