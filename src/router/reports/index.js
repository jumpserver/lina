import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default {
  path: '/reports',
  redirect: '/reports/index',
  component: empty,
  meta: {
    title: i18n.t('PersonalSettings'),
    icon: 'personal',
    view: 'profile',
    type: 'view',
    showNavSwitcher: false,
    showOrganization: false,
    permissions: []
  },
  children: [
    {
      path: '/reports/index',
      name: 'Reports',
      component: () => import('@/views/reports/Users/UserActivity.vue'),
      meta: {
        title: i18n.t('YourProfile'),
        icon: 'attestation',
        permissions: []
      }
    },
    {
      path: '/reports/audits',
      name: 'Audits',
      component: () => import('@/views/reports/Audits/Dashboard.vue'),
      meta: {
        title: i18n.t('Audits'),
        icon: 'attestation',
        permissions: []
      }
    },
    {
      path: '/reports/console',
      name: 'Console',
      component: () => import('@/views/reports/Console/index.vue'),
      meta: {
        title: i18n.t('Console'),
        icon: 'attestation',
        permissions: []
      }
    },
    {
      path: '/reports/pam',
      name: 'Pam',
      component: () => import('@/views/reports/PAM/index.vue'),
      meta: {
        title: i18n.t('PAM'),
        icon: 'attestation',
        permissions: []
      }
    }
  ]
}
