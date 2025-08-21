import i18n from '@/i18n/i18n'

export default [
  {
    path: 'console',
    component: () => import('@/views/reports/console/index.vue'), // Parent router-view
    name: 'ConsoleReport',
    meta: {
      permissions: [],
      icon: 'user-o',
      expanded: true,
      title: i18n.t('ConsoleReport')
    }
  },
  {
    path: 'pam',
    component: () => import('@/views/reports/pam/Dashboard/index.vue'), // Parent router-view
    name: 'PamReport',
    meta: {
      permissions: [],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('PamReport')
    }
  },
  {
    path: 'audits',
    component: () => import('@/views/reports/audits/Dashboard.vue'), // Parent router-view
    name: 'AuditsReport',
    meta: {
      permissions: [],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('AuditsReport')
    }
  },
  {
    path: 'change-secret',
    component: () => import('@/views/reports/pam/ChangeSecret/index.vue'),
    name: 'ChangeSecretReport',
    meta: {
      permissions: [],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('ChangeSecretReport')
    }
  }
]
