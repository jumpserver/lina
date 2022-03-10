import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

import UsersRoute from './users'
import AssetsRoute from './assets'
import ApplicationsRoute from './applications'
import PermsRoute from './perms'
import OpsRoutes from './ops'
import AclRoutes from './acls'
import AccountRoutes from './accounts'

export default {
  path: '/console',
  component: Layout,
  name: 'console',
  redirect: '/console/dashboard',
  meta: {
    title: i18n.t('common.nav.Console'),
    icon: 'el-icon-s-operation',
    view: 'console',
    type: 'view',
    showNavSwitcher: true,
    permissions: ['rbac.view_console']
  },
  children: [
    {
      path: '/console/dashboard',
      component: () => import('@/views/dashboard/index'),
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
        icon: 'inbox'
      },
      children: AssetsRoute
    },
    {
      path: '/console/applications',
      component: empty,
      name: 'applications',
      meta: {
        title: i18n.t('route.Applications'),
        icon: 'th'
      },
      children: ApplicationsRoute
    },
    {
      path: '/console/accounts',
      component: empty,
      name: 'Accounts',
      meta: {
        licenseRequired: true,
        title: i18n.t('route.Accounts'),
        icon: 'address-book'
      },
      children: AccountRoutes
    },
    {
      path: '/console/perms',
      component: empty,
      name: 'Perms',
      meta: {
        title: i18n.t('route.Perms'),
        icon: 'edit'
      },
      children: PermsRoute
    },
    {
      path: '/console/acls',
      component: empty,
      name: 'Acl',
      meta: {
        licenseRequired: true,
        title: i18n.t('route.Acl'),
        icon: 'fort-awesome'
      },
      children: AclRoutes
    },
    {
      path: '/console/ops',
      component: empty,
      name: 'JobCenter',
      meta: {
        title: i18n.t('route.JobCenter'),
        icon: 'coffee'
      },
      children: OpsRoutes
    }
  ]
}

