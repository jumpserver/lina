import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default [
  {
    path: 'login-log',
    name: 'LoginLog',
    component: () => import('@/views/audits/LoginLogList'),
    meta: { title: i18n.t('route.LoginLog'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'ftp-log',
    name: 'FtpLog',
    component: () => import('@/views/audits/FTPLogList'),
    meta: { title: i18n.t('route.FtpLog'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'operate-log',
    name: 'OperateLog',
    component: () => import('@/views/audits/OperateLogList'),
    meta: { title: i18n.t('route.OperateLog'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/audits/PasswordChangeLogList'),
    meta: { title: i18n.t('route.PasswordChangeLog'), permissions: [rolec.PERM_AUDIT] }
  },
  {
    path: 'command-execution-log',
    name: 'BatchCommandLog',
    component: () => import('@/views/audits/CommandExecutionList'),
    meta: { title: i18n.t('route.BatchCommandLog'), permissions: [rolec.PERM_AUDIT] }
  }
]
