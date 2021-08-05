import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

import SessionRoutes from './sessions'
import LogRoutes from './logs'
import empty from '@/layout/empty'

export default {
  path: '/audits/',
  name: 'AuditView',
  component: Layout,
  meta: {
    roles: [rolec.USER],
    permissions: [rolec.PERM_USE],
    view: 'audits'
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: 'sessions',
      component: empty,
      name: 'Sessions',
      meta: { title: i18n.t('route.Sessions'), icon: 'rocket', permissions: [rolec.PERM_AUDIT] },
      children: SessionRoutes
    },
    {
      path: 'logs',
      component: empty,
      redirect: '',
      name: 'Audits',
      meta: { title: i18n.t('route.Audits'), icon: 'history', permissions: [rolec.PERM_AUDIT] },
      children: LogRoutes
    }
  ]
}
