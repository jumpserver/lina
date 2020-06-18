import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
export default [
  {
    path: 'session',
    name: 'SessionList',
    component: () => import('@/views/sessions/SessionList/index'),
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
    component: () => import('@/views/sessions/SessionDetail/index'),
    meta: { title: i18n.t('route.SessionDetail'), activeMenu: '/terminal/session', permissions: [rolec.PERM_AUDIT] },
    hidden: true
  },
  {
    path: 'luna',
    name: 'WebTerminal',
    component: () => window.open(`/luna/?_=${Date.now()}`),
    meta: { title: i18n.t('route.WebTerminal') }
  },
  {
    path: 'sftp',
    name: 'FileManager',
    component: () => window.open(`/koko/elfinder/sftp/?`),
    meta: { title: i18n.t('route.FileManager') }
  },
  {
    path: 'terminal',
    name: 'TerminalList',
    component: () => import('@/views/sessions/TerminalList'),
    meta: { title: i18n.t('route.Terminal') }
  },
  {
    path: 'terminals/:id',
    name: 'TerminalDetail',
    component: () => import('@/views/sessions/TerminalDetail'),
    meta: { title: i18n.t('route.Terminal'), activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'terminals/:id/update',
    name: 'TerminalUpdate',
    component: () => import('@/views/sessions/TerminalUpdate'),
    meta: { title: i18n.t('route.Terminal'), activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'storages',
    name: 'Storage',
    component: () => import('@/views/sessions/Storage/index'),
    meta: { activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'replay-storage/create',
    name: 'CreateReplayStorage',
    component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
    meta: { title: i18n.t('route.CreateReplayStorage'), activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'command-storage/create',
    name: 'CreateCommandStorage',
    component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
    meta: { title: i18n.t('route.CreateCommandStorage'), activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'replay-storage/:id/update',
    name: 'ReplayStorageUpdate',
    component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
    meta: { title: i18n.t('route.ReplayStorageUpdate'), activeMenu: '/terminal/terminal' },
    hidden: true
  },
  {
    path: 'command-storage/:id/update',
    name: 'CommandStorageUpdate',
    component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
    meta: { title: i18n.t('route.CommandStorageUpdate'), activeMenu: '/terminal/terminal' },
    hidden: true
  }
]
