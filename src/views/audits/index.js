export default [
  {
    path: 'login-log',
    name: 'LoginLog',
    component: () => import('@/views/audits/LoginLogList.vue'),
    meta: { title: 'LoginLog' }
  },
  {
    path: 'ftp-log',
    name: 'FtpLog',
    component: () => import('@/views/tree/index'),
    meta: { title: 'FtpLog' }
  },
  {
    path: 'operate-log',
    name: 'OperateLog',
    component: () => import('@/views/tree/index'),
    meta: { title: 'OperateLog' }
  },
  {
    path: 'password-change-log',
    name: 'PasswordChangeLog',
    component: () => import('@/views/tree/index'),
    meta: { title: 'PasswordChangeLog' }
  },
  {
    path: 'command-execution-log',
    name: 'BatchCommand',
    component: () => import('@/views/tree/index'),
    meta: { title: 'BatchCommand' }
  }
]
