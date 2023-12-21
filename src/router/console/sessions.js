import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { BASE_URL } from '@/utils/common'

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
    component: () => import('@/views/sessions/CommandList/index'),
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
  }
]
