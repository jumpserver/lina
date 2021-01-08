import i18n from '@/i18n/i18n'
export default [
  {
    path: 'tickets',
    name: 'TicketList',
    component: () => import('@/views/tickets/TicketList'),
    meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets/tickets' },
    hidden: true
  },
  {
    path: 'tickets/:id',
    name: 'TicketDetail',
    component: () => import('@/views/tickets/TicketDetail/index'),
    meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
    hidden: true
  },
  {
    path: 'tickets/request-asset-perm/create',
    name: 'RequestAssetPermTicketCreateUpdate',
    component: () => import('@/views/tickets/RequestAssetPerm/RequestAssetPermTicketCreateUpdate'),
    meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets' },
    hidden: true
  },
  {
    path: 'tickets/request-asset-perm/:id',
    name: 'AssetsTicketDetail',
    component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
    meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
    hidden: true
  },
  {
    path: 'tickets/request-application-perm/create',
    name: 'RequestApplicationPermTicketCreateUpdate',
    component: () => import('@/views/tickets/RequestApplicationPerm/RequestApplicationPermTicketCreateUpdate'),
    meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets' },
    hidden: true
  }
]
