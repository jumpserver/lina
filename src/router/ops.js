import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
import { BASE_URL } from '@/utils/common'

export default [
  {
    path: 'tasks',
    name: 'TaskList',
    component: () => import('@/views/ops/TaskList'),
    meta: { title: i18n.t('route.TaskList') }
  },
  {
    path: 'tasks/:id',
    component: () => import('@/views/ops/TaskDetail/index'),
    name: 'TaskDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/tasks' }
  },
  {
    path: 'adhoc/:id',
    component: () => import('@/views/ops/TaskDetail/AdhocDetail/index'),
    name: 'AdhocDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/tasks' }
  },
  {
    path: 'executions/:id',
    component: () => import('@/views/ops/TaskDetail/HistoryExecutionDetail/index'),
    name: 'HistoryExecutionDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/tasks' }
  },
  {
    path: 'command-executions/create',
    name: 'BatchCommand',
    component: () => import('@/views/ops/CommandExecution'),
    meta: { title: i18n.t('route.BatchCommand'), hidden: ({ settings }) => !settings.SECURITY_COMMAND_EXECUTION }
  },
  // {
  //   path: 'celery/task/:id',
  //   component: () => import('@/views/ops/CeleryTaskLog'),
  //   name: 'CeleryTaskLog',
  //   hidden: true,
  //   meta: { title: i18n.t('route.CeleryTaskLog') }
  // },
  {
    path: `${BASE_URL}/core/flower?_=${Date.now()}`,
    name: 'TaskMonitor',
    // component: () => window.open(`/core/flower?_=${Date.now()}`),
    meta: { title: i18n.t('route.TaskMonitor'), permissions: [rolec.PERM_SUPER] }
  }
]
