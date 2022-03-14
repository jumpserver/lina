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
        component: () => import('@/views/ops/TaskList'),
        meta: { title: i18n.t('route.TaskList') }
      },
      {
        path: ':id',
        component: () => import('@/views/ops/TaskDetail'),
        name: 'TaskDetail',
        hidden: true,
        meta: { title: i18n.t('route.TaskDetail') }
      }
    ]
  },
  {
    path: 'adhoc/:id',
    component: () => import('@/views/ops/TaskDetail/AdhocDetail'),
    name: 'AdhocDetail',
    hidden: true,
    meta: {
      title: i18n.t('route.TaskDetail'),
      permissions: ['ops.view_adhoc'],
      activeMenu: '/ops/tasks'
    }
  },
  {
    path: 'executions/:id',
    component: () => import('@/views/ops/TaskDetail/HistoryExecutionDetail'),
    name: 'HistoryExecutionDetail',
    hidden: true,
    meta: {
      title: i18n.t('route.TaskDetail'),
      permissions: ['ops.view_adhocexecution'],
      activeMenu: '/console/ops/tasks'
    }
  },
  {
    path: 'command-executions/create',
    name: 'BatchCommand',
    component: () => import('@/views/ops/CommandExecution'),
    meta: {
      title: i18n.t('route.BatchCommand'),
      permissions: ['ops.add_adhocexecution'],
      hidden: ({ settings }) => !settings['SECURITY_COMMAND_EXECUTION']
    }
  },
  {
    path: `${BASE_URL}/core/flower/?_=${Date.now()}`,
    name: 'TaskMonitor',
    // component: () => window.open(`/core/flower?_=${Date.now()}`),
    meta: { title: i18n.t('route.TaskMonitor'), permissions: ['ops.view_taskmonitor'] }
  }
]
