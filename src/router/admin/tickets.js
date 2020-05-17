export default [
  {
    path: 'tickets',
    name: 'TicketsList',
    component: () => import('@/views/tickets/TicketList'),
    meta: { title: 'Tickets', icon: 'check-square-o' }
  },
  {
    path: 'tickets/:id',
    name: 'TicketDetail',
    component: () => import('@/views/tickets/TicketDetail/index'),
    meta: { title: 'TicketDetail', activeMenu: '/tickets/tickets' },
    hidden: true
  }
]
