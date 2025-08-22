import i18n from '@/i18n/i18n'

export default [
  {
    path: 'account-statistics',
    component: () => import('@/views/reports/accounts/AccountStatistics.vue'), // Parent router-view
    name: 'AccountStatistics',
    meta: {
      permissions: ['rbac.view_accountstatisticsreport'],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('AccountStatisticsReport')
    }
  },
  {
    path: 'account-automation',
    component: () => import('@/views/reports/accounts/AccountAutomation.vue'), // Parent router-view
    name: 'AccountAutomationReport',
    meta: {
      permissions: ['rbac.view_accountautomationreport'],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('AccountAutomationReport')
    }
  }
]
