import Layout from '@/layout'
import i18n from '@/i18n/i18n'

import SessionRoutes from './sessions'
import LogRoutes from './audits'
import empty from '@/layout/empty'
import store from '@/store'

export default {
  path: '/audit/',
  name: 'audit',
  component: Layout,
  redirect: '/audit/dashboard',
  meta: {
    title: i18n.t('common.nav.Audits'),
    icon: 'audit',
    showNavSwitcher: () => {
      return store.getters.auditOrgs.length > 0
    },
    permissions: [],
    view: 'audit'
  },
  children: [
    {
      path: '/audit/dashboard',
      component: () => import('@/views/dashboard/Audit/index'),
      name: 'AuditDashboard',
      meta: {
        icon: 'dashboard',
        title: i18n.t('route.Dashboard'),
        permissions: []
      }
    },
    {
      path: '/audit/online-user-session',
      component: () => import('@/views/sessions/OnlineSession/OnlineSessionList'),
      name: 'OnlineSession',
      meta: {
        icon: 'users',
        title: i18n.t('route.OnlineSession'),
        permissions: ['audits.view_usersession']
      }
    },
    {
      path: '/audit/sessions',
      component: empty,
      name: 'Sessions',
      redirect: '/audit/sessions/sessions',
      meta: {
        title: i18n.t('route.SessionsAudit'),
        icon: 'session',
        permissions: []
      },
      children: SessionRoutes
    },
    {
      path: '/audit/audits',
      component: empty,
      redirect: '',
      name: 'Audits',
      meta: {
        title: i18n.t('route.LogsAudit'),
        icon: 'log',
        permissions: []
      },
      children: LogRoutes
    }
  ]
}
