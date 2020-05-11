export default [
  {
    path: 'tickets',
    name: 'TicketsList',
    component: () => import('@/views/tickets/TicketsList'),
    meta: { title: 'Tickets', icon: 'check-square-o' }
  }
]
