import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'tickets',
    name: 'TicketList',
    component: () => import('@/views/tickets/TicketList'),
    meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets/tickets' },
    hidden: true,
    children: [
      {
        path: ':id',
        name: 'TicketDetail',
        component: () => import('@/views/tickets/TicketDetail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'request-asset-perm/create',
        name: 'RequestAssetPermTicketCreateUpdate',
        component: () => import('@/views/tickets/RequestAssetPerm/RequestAssetPermTicketCreateUpdate'),
        meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'request-asset-perm/:id',
        name: 'AssetsTicketDetail',
        component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'login-asset-confirm/:id',
        name: 'loginAssetTicketDetail',
        component: () => import('@/views/tickets/LoginAssetConfirm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'request-application-perm/create',
        name: 'RequestApplicationPermTicketCreateUpdate',
        component: () => import('@/views/tickets/RequestApplicationPerm/RequestApplicationPermTicketCreateUpdate'),
        meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'request-application-perm/:id',
        name: 'AppsTicketDetail',
        component: () => import('@/views/tickets/RequestApplicationPerm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets' },
        hidden: true
      },
      {
        path: 'command-confirm/:id',
        name: 'CommandConfirmDetail',
        component: () => import('@/views/tickets/CommandConfirm/Detail/index'),
        meta: { title: i18n.t('route.CommandConfirm'), activeMenu: '/tickets/tickets' },
        hidden: true
      }
    ]
  },
  {
    path: 'flows',
    name: 'TicketFlow',
    component: empty,
    meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets/tickets' },
    hidden: true,
    children: [
      {
        path: 'create',
        name: 'TicketFlowCreate',
        component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
        meta: { title: i18n.t('routes.TicketFlowCreate') },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'TicketFlowUpdate',
        component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
        meta: { title: i18n.t('routes.TicketFlowCreate') },
        hidden: true
      }
    ]
  }
]
