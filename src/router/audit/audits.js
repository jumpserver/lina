import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'login-logs',
    name: 'LoginLog',
    component: empty,
    redirect: {
      name: 'LoginLogList'
    },
    meta: {
      title: i18n.t('BaseLoginLog'),
      icon: 'login',
      permissions: ['audits.view_userloginlog']
    },
    children: [
      {
        path: '',
        name: 'LoginLogList',
        component: () => import('@/views/audits/LoginLog/LoginLogList'),
        meta: {
          title: i18n.t('LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      },
      {
        path: ':id',
        name: 'LoginLogDetail',
        component: () => import('@/views/audits/LoginLog/LoginLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('LoginLog'),
          permissions: ['audits.view_userloginlog']
        }
      }
    ]
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/audits/PasswordChangeLogList'),
    meta: {
      title: i18n.t('UserPasswordChangeLog'),
      menuTitle: i18n.t('PasswordChangeLog'),
      icon: 'password',
      permissions: ['audits.view_passwordchangelog']
    }
  },
  {
    path: 'operate-logs',
    name: '',
    redirect: {
      name: 'OperateLogList'
    },
    component: empty,
    meta: {
      title: i18n.t('BaseOperateLog'),
      icon: 'operate-log',
      permissions: ['audits.view_operatelog']
    },
    children: [
      {
        path: '',
        name: 'OperateLogList',
        component: () => import('@/views/audits/OperateLog/OperateLogList'),
        meta: {
          title: i18n.t('OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      },
      {
        path: ':id',
        name: 'OperateLogDetail',
        component: () => import('@/views/audits/OperateLog/OperateLogDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('OperateLog'),
          permissions: ['audits.view_operatelog']
        }
      }
    ]
  },
  {
    path: 'job-execution-log',
    name: 'JobExecutionLog',
    component: () => import('@/views/audits/JobExecutionLogList'),
    meta: {
      title: i18n.t('JobExecutionLog'),
      icon: 'task',
      permissions: ['audits.view_joblog']
    }
  }
]
