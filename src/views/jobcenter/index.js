export default [
  {
    path: 'tasks',
    name: 'TaskList',
    component: () => import('@/views/jobcenter/TaskList'),
    meta: { title: 'TaskList', activeMenu: '/ops/task' }
  },
  {
    path: 'tasks/:id',
    component: () => import('@/views/jobcenter/TaskDetail'),
    name: 'TaskDetail',
    hidden: true,
    meta: { title: 'TaskDetail', activeMenu: '/ops/task' }
  },
  {
    path: 'adhoc/:id',
    component: () => import('@/views/jobcenter/AdhocDetail'),
    name: 'AdhocDetail',
    hidden: true,
    meta: { title: 'TaskDetail', activeMenu: '/ops/task' }
  },
  {
    path: 'executions/:id',
    component: () => import('@/views/jobcenter/HistoryExecutionDetail'),
    name: 'HistoryExecutionDetail',
    hidden: true,
    meta: { title: 'TaskDetail', activeMenu: '/ops/task' }
  },
  {
    path: 'command-executions/create',
    name: 'BatchCommand',
    component: () => import('@/views/jobcenter/CommandExecution'),
    meta: { title: 'BatchCommand' }
  }
]
