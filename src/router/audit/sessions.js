import i18n from '@/i18n/i18n'

export default [
  {
    path: 'sessions',
    name: 'SessionList',
    component: () => import('@/views/sessions/SessionList'),
    meta: {
      title: i18n.t('route.Sessions'),
      permissions: ['terminal.view_session']
    },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList'),
        meta: {
          title: i18n.t('route.SessionList'),
          permissions: ['terminal.view_session']
        }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail'),
        hidden: true,
        meta: { title: i18n.t('route.SessionDetail') }
      }
    ]
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: {
      title: i18n.t('route.Commands'),
      permissions: ['terminal.view_command']
    }
  }
]
