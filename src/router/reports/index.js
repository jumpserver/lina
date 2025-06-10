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
    }
  ]
}
