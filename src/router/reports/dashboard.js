import i18n from '@/i18n/i18n'

export default [
  {
    path: 'console',
    component: () => import('@/views/reports/console/index.vue'), // Parent router-view
    name: 'ConsoleReport',
    meta: {
      permissions: ['rbac.view_console'],
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
      permissions: ['rbac.view_pam'],
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
      permissions: ['rbac.view_audits'],
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
      permissions: ['accounts.view_changesecretautomation'],
      expanded: true,
      icon: 'user-o',
      title: i18n.t('ChangeSecretReport')
    }
  }
]
