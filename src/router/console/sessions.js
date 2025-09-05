import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { BASE_URL } from '@/utils/common/index'

export default [
  {
    path: 'sessions',
    component: empty,
    redirect: {
      name: 'SessionList'
    },
    meta: { title: i18n.t('BaseSessions'), permissions: [], icon: 'session' },
    children: [
      {
        path: '',
        name: 'SessionList',
        component: () => import('@/views/sessions/SessionList/index'),
        meta: { title: i18n.t('Sessions'), permissions: [] }
      },
      {
        path: ':id',
        name: 'SessionDetail',
        component: () => import('@/views/sessions/SessionDetail/index'),
        meta: { title: i18n.t('SessionDetail') }
      }
    ]
  },
  {
    path: 'commands',
    name: 'CommandList',
    component: () => import('@/views/sessions/CommandList/index'),
    meta: { title: i18n.t('Commands'), permissions: [] }
  },
  {
    path: `${BASE_URL}/luna/?_=${Date.now()}`,
    name: 'WebTerminal',
    meta: { title: i18n.t('WebTerminal') }
    // hidden: true
  },
  {
    path: `${BASE_URL}/koko/elfinder/sftp/?`,
    name: 'FileManagement',
    meta: { title: i18n.t('FileManagement') }
  }
]
