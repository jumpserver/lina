import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import store from '@/store'

import UsersRoute from './users'
import AssetsRoute from './assets'
import PermsRoute from './perms'
import AccountRoutes from './accounts'
import LabelRoutes from './labels'

export default {
  path: '/console',
  component: Layout,
  name: 'console',
  redirect: '/console/dashboard',
  meta: {
    title: i18n.t('common.nav.Console'),
    icon: 'console',
    view: 'console',
    type: 'view',
    showNavSwitcher: () => {
      return store.getters.consoleOrgs.length > 0
    },
    permissions: []
  },
  children: [
    {
      path: '/console/dashboard',
      component: () => import('@/views/dashboard/Console/index'),
      name: 'AdminDashboard',
      meta: {
        icon: 'dashboard',
        title: i18n.t('route.Dashboard'),
        permissions: []
      }
    },
    {
      path: '/console/users',
      component: empty,
      name: 'Users',
      meta: {
        title: i18n.t('route.Users'),
        icon: 'users'
      },
      children: UsersRoute
    },
    {
      path: '/console/assets',
      component: empty,
      name: 'Assets',
      meta: {
        title: i18n.t('route.Assets'),
        icon: 'assets'
      },
      children: AssetsRoute
    },
    {
      path: '/console/accounts',
      component: empty,
      name: 'Accounts',
      meta: {
        title: i18n.t('route.Accounts'),
        icon: 'accounts'
      },
      children: AccountRoutes
    },
    {
      path: '/console/perms',
      component: empty,
      name: 'Perms',
      alwaysShow: false,
      meta: {
        title: i18n.t('route.Perms'),
        icon: 'permission'
      },
      children: PermsRoute
    },
    {
      path: '/console/more',
      component: empty,
      name: 'More',
      meta: {
        title: i18n.t('route.More'),
        icon: 'more'
      },
      children: LabelRoutes
    }
  ]
}

