import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'ticket-list',
    name: 'TicketList',
    component: empty,
    redirect: {
      name: 'TicketList'
    },
    meta: {
      title: i18n.t('TicketList'),
      icon: 'audit',
      permissions: ['audits.view_joblog']
    },
    children: [
      {
        path: '',
        name: 'AuditTicketList',
        component: () => import('@/views/audits/TicketList'),
        meta: {
          title: i18n.t('TicketList'),
          permissions: []
        }
      }
    ]
  }
]
