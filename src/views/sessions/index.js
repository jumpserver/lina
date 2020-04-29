
export default [
  {
    path: 'session-online',
    name: 'SessionOnlineList',
    component: () => import('@/views/sessions/SessionOnlineList'),
    meta: { title: 'SessionOnline' }
  },
  {
    path: 'session-offline',
    name: 'SessionOfflineList',
    component: () => import('@/views/sessions/SessionOfflineList'),
    meta: { title: 'SessionOffline' }
  },
  {
    path: 'command',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: { title: 'Commands' }
  },
  {
    path: 'sessions/:id',
    name: 'SessionDetail',
    component: () => import('@/views/sessions/SessionDetail'),
    meta: { title: 'SessionDetail' },
    hidden: true
  },
  {
    path: 'luna',
    name: 'WebTerminal',
    component: () => window.open(`/luna/?_=${Date.now()}`),
    meta: { title: 'WebTerminal' }
  },
  {
    path: 'sftp',
    name: 'FileManager',
    component: () => window.open(`/koko/elfinder/sftp/?`),
    meta: { title: 'FileManager' }
  },
  {
    path: 'terminal',
    name: 'TerminalList',
    component: () => import('@/views/sessions/TerminalList'),
    meta: { title: 'Terminal' }
  },
  {
    path: 'terminals/:id',
    name: 'TerminalDetail',
    component: () => import('@/views/sessions/TerminalDetail'),
    meta: { title: 'Terminal' },
    hidden: true
  },
  {
    path: 'terminals/:id/update',
    name: 'TerminalUpdate',
    component: () => import('@/views/sessions/TerminalUpdate'),
    meta: { title: 'Terminal' },
    hidden: true
  },
  {
    path: 'storages',
    name: 'Storage',
    component: () => import('@/views/sessions/Storage'),
    hidden: true
  },
  {
    path: 'replay-storage/create',
    name: 'CreateReplayStorage',
    component: () => import('@/views/sessions/ReplayStorageCreate'),
    meta: { title: 'CreateReplayStorage' },
    hidden: true
  },
  {
    path: 'command-storage/create',
    name: 'CreateCommandStorage',
    component: () => import('@/views/sessions/CommandStorageCreate'),
    meta: { title: 'CreateCommandStorage' },
    hidden: true
  },
  {
    path: 'replay-storage/:id/update',
    name: 'ReplayStorageUpdate',
    component: () => import('@/views/sessions/ReplayStorageUpdate'),
    meta: { title: 'ReplayStorageUpdate' },
    hidden: true
  },
  {
    path: 'command-storage/:id/update',
    name: 'CommandStorageUpdate',
    component: () => import('@/views/sessions/CommandStorageUpdate'),
    meta: { title: 'CommandStorageUpdate' },
    hidden: true
  }
]
