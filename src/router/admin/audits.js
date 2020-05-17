export default [
  {
    path: 'login-log',
    name: 'LoginLog',
    component: () => import('@/views/audits/LoginLogList'),
    meta: { title: 'LoginLog' }
  },
  {
    path: 'ftp-log',
    name: 'FtpLog',
    component: () => import('@/views/audits/FTPLogList'),
    meta: { title: 'FtpLog' }
  },
  {
    path: 'operate-log',
    name: 'OperateLog',
    component: () => import('@/views/audits/OperateLogList'),
    meta: { title: 'OperateLog' }
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/audits/PasswordChangeLogList'),
    meta: { title: 'PasswordChangeLog' }
  },
  {
    path: 'command-execution-log',
    name: 'BatchCommand',
    component: () => import('@/views/audits/CommandExecutionList'),
    meta: { title: 'BatchCommand' }
  }
]
