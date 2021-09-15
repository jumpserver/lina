import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
import empty from '@/layout/empty'
import { BASE_URL } from '@/utils/common'

export default [
  {
    path: 'sessions',
    name: 'SessionList',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.Sessions'), permissions: [rolec.PERM_AUDIT] },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList/index'),
        meta: { title: i18n.t('route.Sessions'), permissions: [rolec.PERM_AUDIT] }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail/index'),
        meta: { title: i18n.t('route.SessionDetail'), activeMenu: '/terminal/sessions' },
        hidden: true
      }
    ]
  },
  {
    path: 'commands',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: { title: i18n.t('route.Commands'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: `${BASE_URL}/luna/?_=${Date.now()}`,
    name: 'WebTerminal',
    // component: () => window.open(`/luna/?_=${Date.now()}`),
    meta: { title: i18n.t('route.WebTerminal') }
    // hidden: true
  },
  {
    path: `${BASE_URL}/koko/elfinder/sftp/?`,
    name: 'FileManager',
    // component: () => window.open(`/koko/elfinder/sftp/?`),
    meta: { title: i18n.t('route.FileManager') }
  },
  {
    path: 'terminal',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.Terminal'), permissions: [rolec.PERM_SUPER] },
    children: [
      {
        path: '',
        name: 'TerminalList',
        component: () => import('@/views/sessions/TerminalList'),
        meta: { title: i18n.t('route.Terminal') }
      },
      {
        path: ':id',
        name: 'TerminalDetail',
        component: () => import('@/views/sessions/TerminalDetail'),
        meta: { title: i18n.t('route.Terminal'), activeMenu: '/terminal/terminal' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'TerminalUpdate',
        component: () => import('@/views/sessions/TerminalUpdate'),
        meta: { title: i18n.t('route.Terminal'), activeMenu: '/terminal/terminal' },
        hidden: true
      }
    ]
  },
  {
    path: 'storages',
    name: 'Storage',
    component: empty,
    meta: { activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    redirect: '',
    hidden: true,
    children: [
      {
        path: '',
        name: 'Storage',
        component: () => import('@/views/sessions/Storage/index'),
        meta: { activeMenu: '/terminal/terminal' }
      },
      {
        path: 'replay-storage/create',
        name: 'CreateReplayStorage',
        component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
        meta: { title: i18n.t('route.CreateReplayStorage'), activeMenu: '/terminal/terminal' }
      },
      {
        path: 'replay-storage/:id/update',
        name: 'ReplayStorageUpdate',
        component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
        meta: { title: i18n.t('route.ReplayStorageUpdate'), activeMenu: '/terminal/terminal' }
      },
      {
        path: 'command-storage/create',
        name: 'CreateCommandStorage',
        component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
        meta: { title: i18n.t('route.CreateCommandStorage'), activeMenu: '/terminal/terminal' }
      },
      {
        path: 'command-storage/:id/update',
        name: 'CommandStorageUpdate',
        component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
        meta: { title: i18n.t('route.CommandStorageUpdate'), activeMenu: '/terminal/terminal' }
      }
    ]
  }
]
