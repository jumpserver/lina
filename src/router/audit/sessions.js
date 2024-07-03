import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'sessions',
    redirect: {
      name: 'SessionList'
    },
    component: empty,
    meta: {
      title: i18n.t('Sessions'),
      app: 'terminal',
      resource: 'session',
      expanded: true,
      icon: 'session',
      permissions: ['terminal.view_session']
    },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList'),
        meta: {
          title: i18n.t('SessionList'),
          permissions: ['terminal.view_session']
        }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail'),
        hidden: true,
        meta: { title: i18n.t('SessionDetail') }
      }
    ]
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList/index'),
    meta: {
      title: i18n.t('SessionCommands'),
      icon: 'command',
      permissions: ['terminal.view_command']
    }
  },
  {
    path: 'ftp',
    name: 'FtpLog',
    component: () => import('@/views/sessions/FTPLogList'),
    meta: {
      title: i18n.t('FileTransfer'),
      icon: 'file-transfer',
      permissions: ['audits.view_ftplog']
    }
  },
  {
    path: '/audit/online-user-session',
    component: () => import('@/views/sessions/OnlineSession/OnlineSessionList'),
    name: 'OnlineSession',
    meta: {
      icon: 'device',
      title: i18n.t('OnlineSession'),
      permissions: ['audits.view_usersession']
    }
  }
]
