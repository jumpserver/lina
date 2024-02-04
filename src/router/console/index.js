import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import store from '@/store'

import UsersMenu from './users'
import AssetsMenu from './assets'
import PermsMenu from './perms'
import AccountMenus from './accounts'
import LabelMenus from './labels'
import AclsMenus from './acls'

export default {
  path: '/console',
  component: Layout,
  name: 'console',
  redirect: '/console/dashboard',
  meta: {
    title: i18n.t('Console'),
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
        title: i18n.t('Dashboard'),
        permissions: []
      }
    },
    {
      path: '/console/users',
      component: empty,
      name: 'Users',
      meta: {
        title: i18n.t('MenuUsers'),
        icon: 'users'
      },
      children: UsersMenu
    },
    {
      path: '/console/assets',
      component: empty,
      name: 'Assets',
      meta: {
        title: i18n.t('MenuAssets'),
        icon: 'assets'
      },
      children: AssetsMenu
    },
    {
      path: '/console/accounts',
      component: empty,
      name: 'Accounts',
      meta: {
        title: i18n.t('MenuAccounts'),
        icon: 'key'
      },
      children: AccountMenus
    },
    {
      path: '/console/perms',
      component: empty,
      name: 'Perms',
      meta: {
        title: i18n.t('MenuPermissions'),
        icon: 'permission',
        resource: 'assetpermission',
        permissions: []
      },
      children: PermsMenu[0].children
    },
    {
      path: '/console/acls',
      component: empty,
      name: 'Acls',
      meta: {
        title: i18n.t('MenuAcls'),
        icon: 'acl'
      },
      children: AclsMenus
    },
    {
      path: '/console/more',
      component: empty,
      name: 'More',
      meta: {
        title: i18n.t('MenuMore'),
        icon: 'more'
      },
      children: LabelMenus
    }
  ]
}

