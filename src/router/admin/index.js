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
import XPackRoutes from './xpack'

export default {
  path: '/admin',
  component: Layout,
  name: 'AdminView',
  redirect: '/admin/dashboard',
  meta: {
    title: i18n.t('common.nav.AdminPage'),
    icon: 'el-icon-s-tools',
    view: 'admin',
    type: 'view',
    showNavSwitcher: true,
    permissions: ['rbac.view_adminview']
  },
  children: [
    {
      path: '/admin/dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'AdminDashboard',
      meta: {
        icon: 'dashboard',
        title: i18n.t('route.Dashboard'),
        permissions: []
      }
    },
    {
      path: '/admin/users',
      component: empty,
      name: 'Users',
      meta: {
        title: i18n.t('route.Users'),
        icon: 'users'
      },
      children: UsersRoute
    },
    {
      path: '/admin/assets',
      component: empty,
      name: 'Assets',
      meta: {
        title: i18n.t('route.Assets'),
        icon: 'inbox'
      },
      children: AssetsRoute
    },
    {
      path: '/admin/applications',
      component: empty,
      name: 'applications',
      alwaysShow: true,
      meta: {
        title: i18n.t('route.Applications'),
        icon: 'th'
      },
      children: ApplicationsRoute
    },
    {
      path: '/admin/accounts',
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
      path: '/admin/perms',
      component: empty,
      name: 'Perms',
      meta: {
        title: i18n.t('route.Perms'),
        icon: 'edit'
      },
      children: PermsRoute
    },
    {
      path: '/admin/acls',
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
      path: '/admin/ops',
      component: empty,
      name: 'JobCenter',
      alwaysShow: true,
      meta: {
        title: i18n.t('route.JobCenter'),
        icon: 'coffee'
      },
      children: OpsRoutes
    },
    {
      path: '/admin/xpack',
      component: empty,
      redirect: '/applications/remote-apps/',
      name: 'Xpack',
      meta: { title: 'X-Pack', icon: 'sitemap', licenseRequired: true },
      children: XPackRoutes
    },
    {
      path: '/admin/settings',
      component: empty,
      children: [
        {
          path: '',
          name: 'Settings',
          component: () => import('@/views/settings/index'),
          meta: {
            title: i18n.t('route.Settings'),
            icon: 'gears', permissions: ['settings.view_setting']
          }
        }
      ]
    }
  ]
}

