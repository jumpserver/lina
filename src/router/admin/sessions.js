import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { BASE_URL } from '@/utils/common'

// Todo: 放到系统设置中
export default [
  {
    path: 'sessions',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.Sessions'), permissions: [] },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList/index'),
        meta: { title: i18n.t('route.Sessions'), permissions: [] }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail/index'),
        meta: { title: i18n.t('route.SessionDetail') }
      }
    ]
  },
  {
    path: 'commands',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList'),
    meta: { title: i18n.t('route.Commands'), permissions: [] }
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
    meta: { title: i18n.t('route.Terminal'), permissions: [] },
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
        meta: {
          title: i18n.t('route.Terminal'), hidden: true
        }
      },
      {
        path: ':id/update',
        name: 'TerminalUpdate',
        component: () => import('@/views/sessions/TerminalUpdate'),
        meta: {
          title: i18n.t('route.Terminal'), hidden: true
        }
      }
    ]
  },
  {
    path: 'storages',
    component: empty,
    meta: {
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
          meta: { title: i18n.t('route.CreateReplayStorage') }
        },
        {
          path: 'replay-storage/:id/update',
          name: 'ReplayStorageUpdate',
          component: () => import('@/views/sessions/ReplayStorageCreateUpdate'),
          meta: { title: i18n.t('route.ReplayStorageUpdate') }
        },
        {
          path: 'command-storage/create',
          name: 'CreateCommandStorage',
          component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
          meta: { title: i18n.t('route.CreateCommandStorage') }
        },
        {
          path: 'command-storage/:id/update',
          name: 'CommandStorageUpdate',
          component: () => import('@/views/sessions/CommandStorageCreateUpdate'),
          meta: { title: i18n.t('route.CommandStorageUpdate') }
        }
      ]
    }
  }
]
