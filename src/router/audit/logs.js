import i18n from '@/i18n/i18n'

export default [
  {
    path: 'login-log',
    name: 'LoginLog',
    component: () => import('@/views/audits/LoginLogList'),
    meta: {
      title: i18n.t('route.LoginLog'),
      permissions: ['audits.view_userloginlog']
    }
  },
  {
    path: 'operate-log',
    name: 'OperateLog',
    component: () => import('@/views/audits/OperateLogList'),
    meta: {
      title: i18n.t('route.OperateLog'),
      permissions: ['audits.view_operatelog']
    }
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
    path: 'command-execution-log',
    name: 'BatchCommandLog',
    component: () => import('@/views/audits/CommandExecutionList'),
    meta: {
      title: i18n.t('route.BatchCommandLog'),
      permissions: ['ops.view_commandexecution']
    }
  }
]
