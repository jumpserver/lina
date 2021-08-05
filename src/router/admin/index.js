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

export default {
  path: '/admin',
  component: Layout,
  redirect: '',
  meta: {
    title: i18n.t('route.AdminPage'),
    icon: 'users',
    view: 'admin'
  },
  children: [
    {
      path: '/',
      component: empty,
      redirect: 'dashboard',
      meta: {
        permissions: []
      },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/index'),
          meta: { title: i18n.t('route.Dashboard'), icon: 'dashboard', permissions: [rolec.PERM_AUDIT] }
        }
      ]
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
      redirect: 'assets',
      name: 'assets',
      meta: { title: i18n.t('route.Assets'), icon: 'inbox' },
      children: AssetsRoute
    },
    {
      path: '/admin/applications',
      component: empty,
      name: 'applications',
      alwaysShow: true,
      meta: { title: i18n.t('route.Applications'), icon: 'th' },
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
      meta: { title: i18n.t('route.Perms'), icon: 'edit' },
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
      meta: { title: i18n.t('route.JobCenter'), icon: 'coffee' },
      children: OpsRoutes
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
          meta: { title: i18n.t('route.Settings'), icon: 'gears', permissions: [rolec.PERM_SUPER] }
        }
      ]
    }
  ]
}

