import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

import users from './users'
import assets from './assets'

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
      path: '/reports/users',
      component: empty,
      redirect: 'users',
      name: 'ReportsUsers',
      meta: {
        title: i18n.t('ReportsUsers'),
        icon: 'reports',
        permissions: []
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
        permissions: []
      },
      children: assets
    }
    // {
    //   path: '/reports/assets',
    //   component: empty,
    //   redirect: '/reports/users/users',
    //   name: 'ReportsAssets',
    //   meta: {
    //     title: i18n.t('ReportsAssets'),
    //     icon: 'reports',
    //     permissions: []
    //   },
    //   children: users
    // }
  ]
}
