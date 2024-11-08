import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'job-list',
    name: 'JobList',
    component: empty,
    redirect: {
      name: 'JobList'
    },
    meta: {
      title: i18n.t('JobList'),
      icon: 'task',
      permissions: []
    },
    children: [
      {
        path: '',
        name: 'JobList',
        component: () => import('@/views/audits/JobPeriodTaskList'),
        meta: {
          title: i18n.t('JobList'),
          permissions: []
        }
      }
    ]
  },
  {
    path: 'job-execution-log',
    name: 'JobExecutionLog',
    component: empty,
    redirect: {
      name: 'JobExecutionLog'
    },
    meta: {
      title: i18n.t('JobExecutionLog'),
      icon: 'history',
      permissions: ['audits.view_joblog']
    },
    children: [
      {
        path: '',
        name: 'JobExecutionLog',
        component: () => import('@/views/audits/JobExecutionLogList'),
        meta: {
          title: i18n.t('JobExecutionLog'),
          permissions: ['audits.view_joblog']
        }
      }
    ]
  }
]
