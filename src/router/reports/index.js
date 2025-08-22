import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

import users from './users'
import assets from './assets'
import accounts from './accounts'
import dashboard from './dashboard'

export default {
  path: '/reports',
  redirect: '/reports/users',
  component: empty,
  meta: {
    title: i18n.t('Reports'),
    icon: 'fa-bar-chart-o',
    view: 'reports',
    showNavSwitcher: false,
    permissions: []
  },
  children: [
    {
      path: '/reports/dashboard',
      component: empty,
      redirect: 'dashboard',
      name: 'ReportsDashboard',
      meta: {
        title: i18n.t('ReportsDashboard'),
        icon: 'reports',
        permissions: []
      },
      children: dashboard
    },
    {
      path: '/reports/users',
      component: empty,
      redirect: 'users',
      name: 'ReportsUsers',
      meta: {
        title: i18n.t('ReportsUsers'),
        icon: 'reports',
        permissions: ['rbac.view_userloginreport | rbac.view_userchangepasswordreport']
      },
      children: users
    },
    {
      path: '/reports/assets',
      component: empty,
      redirect: 'assets',
      name: 'ReportsAssets',
      meta: {
        title: i18n.t('ReportsAssets'),
        icon: 'reports',
        permissions: ['rbac.view_assetactivityreport | rbac.view_assetstatisticsreport']
      },
      children: assets
    },
    {
      path: '/reports/accounts',
      component: empty,
      redirect: 'accounts',
      name: 'ReportsAccounts',
      meta: {
        title: i18n.t('ReportsAccounts'),
        icon: 'reports',
        permissions: ['rbac.view_accountstatisticsreport | rbac.view_accountautomationreport']
      },
      children: accounts
    }
  ]
}
