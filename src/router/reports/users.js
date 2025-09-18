import i18n from '@/i18n/i18n'

export default [
  {
    path: 'user-activity',
    component: () => import('@/views/reports/users/UserActivity.vue'), // Parent router-view
    name: 'UserReport',
    meta: {
      permissions: ['rbac.view_userloginreport'],
      icon: 'user-o',
      expanded: true,
      title: i18n.t('UserLoginReport')
    }
  },
  {
    path: 'change-password',
    component: () => import('@/views/reports/users/ChangePassword.vue'), // Parent router-view
    name: 'ChangePassword',
    meta: {
      permissions: ['rbac.view_userchangepasswordreport'],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('UserChangePasswordReport')
    }
  }
]
