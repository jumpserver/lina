import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import empty from '@/layout/empty'
import store from '@/store'
import automations from './automations'
import services from './service'
import security from './security'

export default {
  path: '/pam/',
  name: 'pam',
  component: Layout,
  redirect: '/pam/dashboard',
  meta: {
    title: i18n.t('PAM'),
    icon: 'pam',
    type: 'view',
    showNavSwitcher: () => {
      return store.getters.consoleOrgs.length > 0
    },
    permissions: [],
    view: 'pam'
  },
  children: [
    {
      path: '/pam/dashboard',
      component: () => import('@/views/dashboard/Audit/index'),
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
      component: () => import('@/views/pam/Account/AccountList.vue'),
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
      // redirect: '/audit/sessions/sessions',
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
      path: '/pam/services',
      name: 'AccountService',
      meta: {
        title: i18n.t('Service'),
        icon: 'accounts',
        permissions: []
      },
      children: services
    }
  ]
}
