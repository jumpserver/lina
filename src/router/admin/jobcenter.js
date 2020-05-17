import i18n from '@/i18n/i18n'

export default [
  {
    path: 'tasks',
    name: 'TaskList',
    component: () => import('@/views/jobcenter/TaskList'),
    meta: { title: i18n.t('route.TaskList'), activeMenu: '/ops/task' }
  },
  {
    path: 'tasks/:id',
    component: () => import('@/views/jobcenter/TaskDetail/index'),
    name: 'TaskDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/task' }
  },
  {
    path: 'adhoc/:id',
    component: () => import('@/views/jobcenter/TaskDetail/AdhocDetail/index'),
    name: 'AdhocDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/task' }
  },
  {
    path: 'executions/:id',
    component: () => import('@/views/jobcenter/TaskDetail/HistoryExecutionDetail/index'),
    name: 'HistoryExecutionDetail',
    hidden: true,
    meta: { title: i18n.t('route.TaskDetail'), activeMenu: '/ops/task' }
  },
  {
    path: 'command-executions/create',
    name: 'BatchCommand',
    component: () => import('@/views/jobcenter/CommandExecution'),
    meta: { title: i18n.t('route.BatchCommand') }
  },
  {
    path: 'celery/task/:id',
    component: () => import('@/views/jobcenter/CeleryTaskLog'),
    name: 'CeleryTaskLog',
    hidden: true,
    meta: { title: i18n.t('route.CeleryTaskLog') }
  }
]
