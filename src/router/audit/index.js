import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import SessionRoutes from './sessions'
import LogRoutes from './logs'
import empty from '@/layout/empty'

export default {
  path: '/audit/',
  name: 'audit',
  component: Layout,
  redirect: '/audit/dashboard',
  meta: {
    title: i18n.t('common.nav.Audits'),
    icon: 'el-icon-s-claim',
    showNavSwitcher: true,
    permissions: ['rbac.view_audit'],
    view: 'audit'
  },
  children: [
    {
      path: '/audit/dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'AuditDashboard',
      meta: {
        icon: 'dashboard',
        title: i18n.t('route.Dashboard'),
        permissions: []
      }
    },
    {
      path: '/audit/sessions',
      component: empty,
      name: 'Sessions',
      redirect: '/audit/sessions/sessions',
      meta: {
        title: i18n.t('route.SessionsAudit'),
        icon: 'rocket',
        permissions: []
      },
      children: SessionRoutes
    },
    {
      path: '/audit/logs',
      component: empty,
      redirect: '',
      name: 'Audits',
      meta: {
        title: i18n.t('route.LogsAudit'),
        icon: 'history',
        permissions: []
      },
      children: LogRoutes
    }
  ]
}
