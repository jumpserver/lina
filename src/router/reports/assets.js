import i18n from '@/i18n/i18n'

export default [
  {
    path: 'asset-activity',
    component: () => import('@/views/reports/assets/AssetActivity.vue'), // Parent router-view
    name: 'AssetReport',
    meta: {
      permissions: ['rbac.view_assetactivityreport'],
      icon: 'user-o',
      expanded: true,
      title: i18n.t('AssetActivityReport')
    }
  },
  {
    path: 'asset-statistics',
    component: () => import('@/views/reports/assets/AssetStatistics.vue'), // Parent router-view
    name: 'AssetStatistics',
    meta: {
      permissions: ['rbac.view_assetstatisticsreport'],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('AssetStatisticsReport')
    }
  }
]
