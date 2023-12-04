import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'sessions',
    redirect: '',
    component: empty,
    meta: {
      title: i18n.t('route.Sessions'),
      app: 'terminal',
      resource: 'session',
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
    component: () => import('@/views/sessions/CommandList/index'),
    meta: {
      title: i18n.t('route.Commands'),
      permissions: ['terminal.view_command']
    }
  },
  {
    path: 'ftp',
    name: 'FtpLog',
    component: () => import('@/views/sessions/FTPLogList'),
    meta: {
      title: i18n.t('route.FileTransfer'),
      permissions: ['audits.view_ftplog']
    }
  }
]
