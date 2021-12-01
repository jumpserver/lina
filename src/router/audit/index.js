import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import SessionRoutes from './sessions'
import LogRoutes from './logs'
import empty from '@/layout/empty'

export default {
  path: '/audit/',
  name: 'AuditView',
  component: Layout,
  meta: {
    title: i18n.t('common.nav.AuditPage'),
    permissions: ['rbac.view_auditview'],
    view: 'audit'
  },
  children: [
    {
      path: '/audit/dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'AuditDashboard',
      meta: {
        icon: 'files-o',
        title: i18n.t('route.Dashboard'),
        permissions: []
      }
    },
    {
      path: '/audit/sessions',
      component: empty,
      name: 'Sessions',
      redirect: '/audit/sessions/sessions',
      alwaysShow: true,
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
        icon: 'history'
      },
      children: LogRoutes
    }
  ]
}
