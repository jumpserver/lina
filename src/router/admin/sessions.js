import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
import empty from '@/layout/empty'

// Todo: 放到系统设置中
export default [
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
    component: () => import('@/views/sessions/Storage'),
    meta: { activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    hidden: true
  },
  {
    path: 'replay-storage/create',
    name: 'CreateReplayStorage',
    component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
    meta: { title: i18n.t('route.CreateReplayStorage'), activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    hidden: true
  },
  {
    path: 'command-storage/create',
    name: 'CreateCommandStorage',
    component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
    meta: { title: i18n.t('route.CreateCommandStorage'), activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    hidden: true
  },
  {
    path: 'replay-storage/:id/update',
    name: 'ReplayStorageUpdate',
    component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
    meta: { title: i18n.t('route.ReplayStorageUpdate'), activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    hidden: true
  },
  {
    path: 'command-storage/:id/update',
    name: 'CommandStorageUpdate',
    component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
    meta: { title: i18n.t('route.CommandStorageUpdate'), activeMenu: '/terminal/terminal', permissions: [rolec.PERM_SUPER] },
    hidden: true
  }
]
