import i18n from '@/i18n/i18n'
export default [
  {
    path: 'tickets',
    name: 'TicketsList',
    component: () => import('@/views/tickets/TicketList'),
    meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o' }
  },
  {
    path: 'tickets/:id',
    name: 'TicketDetail',
    component: () => import('@/views/tickets/TicketDetail/index'),
    meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
    hidden: true
  }
]
