import i18n from '@/i18n/i18n'

export default [
  {
    path: 'user-activity',
    component: () => import('@/views/reports/users/UserActivity.vue'), // Parent router-view
    name: 'UserActivity',
    meta: {
      permissions: [],
      icon: 'user-o',
      expanded: true,
      title: i18n.t('ReportsUsers2')
    }
  },
  {
    path: 'group-activity',
    component: () => import('@/views/reports/audits/Dashboard.vue'), // Parent router-view
    name: 'GroupActivity',
    meta: {
      permissions: [],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('ReportsGroups')
    }
  }
]
