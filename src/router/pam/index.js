import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import empty from '@/layout/empty'
import automations from './automations'
import integrations from './integrations'
import security from './security'
import activity from './activity'

export default {
  path: '/pam/',
  name: 'pam',
  component: Layout,
  redirect: '/pam/dashboard',
  meta: {
    title: i18n.t('PAM'),
    icon: 'pam',
    type: 'view',
    showNavSwitcher: true,
    permissions: [],
    view: 'pam'
  },
  children: [
    {
      path: '/pam/dashboard',
      component: () => import('@/views/dashboard/Pam/index'),
      name: 'PamDashboard',
      meta: {
        icon: 'dashboard',
        title: i18n.t('Dashboard'),
        permissions: []
      }
    },
    {
      path: '/pam/accounts',
      name: 'PamAccounts',
      component: () => import('@/views/pam/Account/index.vue'),
      meta: {
        title: i18n.t('Accounts'),
        icon: 'accounts',
        permissions: []
      }
    },
    {
      path: '/pam/automations',
      name: 'AccountAutomation',
      component: empty,
      meta: {
        title: i18n.t('Automation'),
        icon: 'accounts',
        permissions: []
      },
      children: automations
    },
    {
      path: '/pam/security',
      name: 'AccountSecurity',
      component: empty,
      meta: {
        title: i18n.t('Security'),
        icon: 'accounts',
        permissions: []
      },
      children: security
    },
    {
      path: '/pam/integrations',
      name: 'Integrations',
      component: empty,
      meta: {
        title: i18n.t('Integration'),
        icon: 'accounts',
        permissions: []
      },
      children: integrations
    },
    {
      path: '/pam/activity',
      name: 'AccountActivity',
      component: empty,
      meta: {
        title: i18n.t('Activity'),
        icon: 'accounts',
        permissions: []
      },
      children: activity
    }
  ]
}
