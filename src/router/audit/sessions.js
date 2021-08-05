import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default [
  {
    path: 'session',
    name: 'SessionList',
    component: () => import('@/views/sessions/SessionList'),
    meta: { title: i18n.t('route.Sessions'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: { title: i18n.t('route.Commands'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'sessions/:id',
    name: 'SessionDetail',
    component: () => import('@/views/sessions/SessionDetail'),
    meta: { title: i18n.t('route.SessionDetail'), activeMenu: '/terminal/session', permissions: [rolec.PERM_AUDIT] },
    hidden: true
  }
]
