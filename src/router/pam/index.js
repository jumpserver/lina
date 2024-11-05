import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import empty from '@/layout/empty'
import automations from './automations'
import services from './service'
import security from './security'
import activity from './activity'

export default {
  path: '/pam/',
  name: 'pam',
  component: Layout,
  redirect: '/pam/dashboard',
  meta: {
    title: '特权账号',
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
        title: i18n.t('特权账号'),
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
        title: i18n.t('安全中心'),
        icon: 'accounts',
        permissions: []
      },
      children: security
    },
    {
      path: '/pam/services',
      name: 'AccountService',
      component: empty,
      meta: {
        title: i18n.t('Service'),
        icon: 'accounts',
        permissions: []
      },
      children: services
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
