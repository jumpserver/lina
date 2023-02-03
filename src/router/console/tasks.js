import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common'
import empty from '@/layout/empty'

export default [
  {
    path: 'tasks',
    component: empty,
    meta: { title: i18n.t('route.TaskList') },
    children: [
      {
        path: '',
        name: 'TaskList',
        component: () => import('@/views/tasks/TaskList'),
        meta: { title: i18n.t('route.TaskList'), permissions: ['ops.view_celerytask'] }
      },
      {
        path: ':id',
        component: () => import('@/views/tasks/TaskDetail'),
        name: 'TaskDetail',
        hidden: true,
        meta: { title: i18n.t('route.TaskDetail'), permissions: ['ops.view_celerytask'] }
      }
    ]
  },
  {
    path: `${BASE_URL}/core/flower/?_=${Date.now()}`,
    name: 'TaskMonitor',
    // component: () => window.open(`/core/flower?_=${Date.now()}`),
    meta: { title: i18n.t('route.TaskMonitor'), permissions: ['ops.view_taskmonitor'] }
  }
]
