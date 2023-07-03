import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'login-logs',
    name: 'LoginLog',
    component: empty,
    meta: {
      title: i18n.t('route.LoginLog'),
      permissions: ['audits.view_userloginlog']
    },
    children: [
      {
        path: '',
        name: 'LoginLogList',
        component: () => import('@/views/audits/LoginLog/LoginLogList'),
        meta: {
          title: i18n.t('route.LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      },
      {
        path: ':id',
        name: 'LoginLogDetail',
        component: () => import('@/views/audits/LoginLog/LoginLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('route.LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      }
    ]
  },
  {
    path: 'operate-logs',
    name: '',
    component: empty,
    meta: {
      title: i18n.t('route.OperateLog'),
      permissions: ['audits.view_operatelog']
    },
    children: [
      {
        path: '',
        name: 'OperateLogList',
        component: () => import('@/views/audits/OperateLog/OperateLogList'),
        meta: {
          title: i18n.t('route.OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      },
      {
        path: ':id',
        name: 'OperateLogDetail',
        component: () => import('@/views/audits/OperateLog/OperateLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('route.OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      }
    ]
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/audits/PasswordChangeLogList'),
    meta: {
      title: i18n.t('route.PasswordChangeLog'),
      permissions: ['audits.view_passwordchangelog']
    }
  },
  {
    path: 'job-execution-log',
    name: 'JobExecutionLog',
    component: () => import('@/views/audits/JobExecutionLogList'),
    meta: {
      title: i18n.t('route.JobExecutionLog'),
      permissions: ['audits.view_joblog']
    }
  }
]
