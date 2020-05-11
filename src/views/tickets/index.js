import Layout from '@/layout'
const TicketsRoutes = [
  {
    path: 'tickets',
    name: 'TicketsList',
    component: () => import('@/views/tickets/TicketsList'),
    meta: { title: 'Tickets', icon: 'check-square-o' }
  }
]
export default {
  path: '/tickets/',
  component: Layout,
  redirect: '/tickets/tickets/',
  children: TicketsRoutes
}

