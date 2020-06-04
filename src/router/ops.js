import i18n from '@/i18n/i18n'

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
    meta: { title: i18n.t('route.BatchCommand') }
  },
  {
    path: 'celery/task/:id',
    component: () => import('@/views/ops/CeleryTaskLog'),
    name: 'CeleryTaskLog',
    hidden: true,
    meta: { title: i18n.t('route.CeleryTaskLog') }
  },
  {
    path: 'task/monitor',
    name: 'TaskMonitor',
    component: () => window.open(`/core/flower?_=${Date.now()}`),
    meta: { title: i18n.t('route.TaskMonitor') }
  }
]
