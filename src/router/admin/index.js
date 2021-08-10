import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
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
    title: i18n.t('route.AdminPage'),
    icon: 'users',
    view: 'admin',
    type: 'view',
    permissions: ['rbac.view_adminview']
  },
  children: [
    {
      path: '/admin/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: i18n.t('route.Dashboard'),
        icon: 'dashboard'
      }
    },
    {
      path: '/admin/users',
      component: empty,
      name: 'Users',
      meta: {
        title: i18n.t('route.Users'),
        icon: 'users',
        app: 'users',
        type: 'app'
      },
      children: UsersRoute
    },
    {
      path: '/admin/assets',
      component: empty,
      name: 'Assets',
      meta: {
        title: i18n.t('route.Assets'),
        icon: 'inbox',
        app: 'assets',
        type: 'app'
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
        icon: 'th',
        app: 'applications',
        type: 'app'
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
        icon: 'address-book',
        app: 'assets',
        type: 'app'
      },
      children: AccountRoutes
    },
    {
      path: '/admin/perms',
      component: empty,
      name: 'Perms',
      meta: {
        title: i18n.t('route.Perms'),
        icon: 'edit',
        app: 'perms',
        type: 'app'
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
        icon: 'fort-awesome',
        app: 'acls',
        type: 'app'
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
        icon: 'coffee',
        type: 'app',
        app: 'ops'
      },
      children: OpsRoutes
    },
    {
      path: '/admin/xpack',
      component: empty,
      redirect: '/applications/remote-apps/',
      name: 'Xpack',
      meta: { title: 'X-Pack', icon: 'sitemap', licenseRequired: true, type: 'app', app: 'xpack' },
      children: XPackRoutes
    },
    {
      path: '/admin/settings',
      component: empty,
      redirect: '/settings/',
      permissions: [rolec.PERM_SUPER],
      children: [
        {
          path: '',
          name: 'Settings',
          component: () => import('@/views/settings/index'),
          meta: { title: i18n.t('route.Settings'), icon: 'gears', app: 'settings' }
        }
      ]
    }
  ]
}

