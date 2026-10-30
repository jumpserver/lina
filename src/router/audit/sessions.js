import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { agentAuditRoute } from '@/views/audits/AgentAudit/routes'

export default [
  ...['sessions', 'actions'].map((kind) => {
    const resource = kind === 'sessions' ? 'AgentSession' : 'AgentAction'
    const title = kind === 'sessions' ? 'AgentSessions' : 'AgentActions'
    return {
      path: `agent-${kind}`,
      component: empty,
      hidden: true,
      redirect: { name: `${resource}List` },
      meta: {
        title: i18n.t(title),
        app: 'terminal',
        resource: resource.toLowerCase(),
        icon: 'audit',
        permissions: []
      },
      children: [
        {
          path: '',
          name: `${resource}List`,
          redirect: (to) => ({
            ...agentAuditRoute(kind),
            query: { ...to.query, ...agentAuditRoute(kind).query }
          }),
          meta: { title: i18n.t(title), permissions: [] }
        },
        {
          path: ':id',
          name: `${resource}Detail`,
          component: () => import('@/views/audits/AgentAudit/index.vue'),
          props: { kind },
          hidden: true,
          meta: {
            title: i18n.t(title),
            permissions: [],
            activeMenu: kind === 'sessions' ? '/audit/sessions/sessions' : '/audit/sessions/command'
          }
        }
      ]
    }
  }),
  {
    path: 'sessions',
    redirect: {
      name: 'SessionList'
    },
    component: empty,
    meta: {
      title: i18n.t('SessionRecords'),
      app: 'terminal',
      resource: 'session',
      expanded: true,
      icon: 'session',
      permissions: []
    },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/audits/SessionRecords.vue'),
        meta: {
          title: i18n.t('SessionRecords'),
          permissions: []
        }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail'),
        hidden: true,
        meta: { title: i18n.t('SessionDetail'), permissions: ['terminal.view_session'] }
      }
    ]
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/audits/CommandRecords.vue'),
    meta: {
      title: i18n.t('CommandRecords'),
      icon: 'command',
      permissions: []
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
