import i18n from '@/i18n/i18n'
import users from '../reports/users'
import assets from '../reports/assets'
import accounts from '../reports/accounts'

const reportMeta = (title) => ({
  title: i18n.t(title),
  permissions: ['rbac.view_audit'],
  licenseRequired: true
})

// Keep saved legacy templates and bookmarks usable, inside the audit console.
const legacy = (group, routes) =>
  routes.map((route) => ({
    ...route,
    path: `legacy/${group}/${route.path}`,
    hidden: true,
    meta: { ...route.meta, activeMenu: '/audit/reports/overview' }
  }))

export default [
  {
    path: 'overview',
    name: 'AuditReportOverview',
    component: () => import('@/views/reports/center/index.vue'),
    meta: { ...reportMeta('AuditReportOverview'), icon: 'file' }
  },
  {
    path: 'templates',
    redirect: '/audit/reports/overview',
    hidden: true,
    meta: { permissions: [] }
  },
  {
    path: 'editor',
    name: 'AuditReportEditor',
    component: () => import('@/views/reports/center/Editor.vue'),
    hidden: true,
    meta: { ...reportMeta('AuditReportConfigure'), activeMenu: '/audit/reports/overview' }
  },
  ...legacy('users', users),
  ...legacy('assets', assets),
  ...legacy('accounts', accounts),
  ...['users', 'assets', 'accounts'].map((group) => ({
    path: `legacy/${group}`,
    name: `LegacyReportTemplates-${group}`,
    component: () => import(`@/views/reports/${group}/index.vue`),
    props: { nav: false },
    hidden: true,
    meta: { ...reportMeta('AuditReportLegacyTemplates'), activeMenu: '/audit/reports/overview' }
  })),
  ...['users', 'assets', 'accounts'].map((group) => ({
    path: group,
    redirect: (to) => ({ path: `/audit/reports/legacy/${group}`, query: to.query }),
    hidden: true,
    meta: { permissions: [] }
  }))
]
