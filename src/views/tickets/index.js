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
    component: () => import('@/views/tickets/TicketDetail'),
    meta: { title: 'TicketDetail', icon: 'check-square-o' }
  }
]
