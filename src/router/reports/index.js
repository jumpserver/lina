import empty from '@/layout/empty'
import users from './users'
import assets from './assets'
import accounts from './accounts'
import dashboard from './dashboard'

const redirectLegacy = (group, routes) =>
  routes.map((route) => ({
    path: `${group}/${route.path}`,
    hidden: true,
    redirect: (to) => ({
      path: `/audit/reports/legacy/${group}/${route.path}`,
      query: to.query
    }),
    meta: { permissions: [] }
  }))

export default {
  path: '/reports',
  component: empty,
  hidden: true,
  redirect: '/audit/reports/overview',
  meta: { view: 'reports', showNavSwitcher: false, permissions: [] },
  children: [
    ...redirectLegacy('users', users),
    ...redirectLegacy('assets', assets),
    ...redirectLegacy('accounts', accounts),
    ...['users', 'assets', 'accounts'].map((group) => ({
      path: group,
      hidden: true,
      redirect: (to) => ({ path: `/audit/reports/legacy/${group}`, query: to.query }),
      meta: { permissions: [] }
    })),
    ...dashboard.map((route) => ({
      path: `dashboard/${route.path}`,
      name: route.name,
      hidden: true,
      redirect: {
        path: '/audit/reports/editor',
        query: {
          theme: route.path === 'pam' || route.path === 'change-secret' ? 'account' : 'audit'
        }
      },
      meta: { permissions: [] }
    })),
    {
      path: ':pathMatch(.*)*',
      redirect: '/audit/reports/overview',
      hidden: true,
      meta: { permissions: [] }
    }
  ]
}
