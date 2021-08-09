import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

import SessionRoutes from './sessions'
import LogRoutes from './logs'
import empty from '@/layout/empty'

export default {
  path: '/audit/',
  name: 'AuditView',
  component: Layout,
  redirect: '/audit/sessions',
  meta: {
    permissions: ['rbac.view_auditview'],
    view: 'audit'
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: '/audit/sessions',
      component: empty,
      name: 'Sessions',
      redirect: '/audit/sessions/sessions',
      meta: { title: i18n.t('route.Sessions'), icon: 'rocket', permissions: [rolec.PERM_AUDIT] },
      children: SessionRoutes
    },
    {
      path: '/audit/logs',
      component: empty,
      redirect: '',
      name: 'Audits',
      meta: { title: i18n.t('route.Audits'), icon: 'history', permissions: [rolec.PERM_AUDIT] },
      children: LogRoutes
    }
  ]
}
