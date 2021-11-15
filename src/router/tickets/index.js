import Layout from '@/layout'
import i18n from '@/i18n/i18n'

export default {
  path: '/tickets',
  redirect: '/tickets/list',
  component: Layout,
  meta: {
    title: i18n.t('route.Tickets'),
    icon: 'check-square-o',
    activeMenu: '/tickets',
    view: 'tickets',
    type: 'view',
    permissions: []
  },
  children: [
    {
      path: '/tickets/list',
      name: 'TicketList',
      component: () => import('@/views/tickets/Todo'),
      meta: {
        title: i18n.t('route.Tickets'),
        icon: 'check-square-o',
        permissions: []
      }
    },
    {
      path: '/tickets/todo',
      name: 'TicketTodo',
      component: () => import('@/views/tickets/Todo'),
      meta: {
        title: i18n.t('route.TicketsTodo'),
        icon: 'check-square-o',
        permissions: []
      }
    },
    {
      path: '/tickets/create',
      name: 'TicketNew',
      component: () => import('@/views/tickets/TicketList'),
      meta: {
        title: i18n.t('route.TicketsNew'),
        icon: 'check-square-o',
        permissions: []
      }
    },
    {
      path: '/tickets/done',
      name: 'TicketNew',
      component: () => import('@/views/tickets/TicketList'),
      meta: {
        title: i18n.t('route.TicketsDone'),
        icon: 'check-square-o',
        permissions: []
      }
    },
    {
      path: '/tickets/:id',
      name: 'TicketDetail',
      component: () => import('@/views/tickets/Todo'),
      hidden: true,
      meta: {
      }
    }
    // {
    //   path: 'request-asset-perm/create',
    //   name: 'RequestAssetPermTicketCreateUpdate',
    //   component: () => import('@/views/tickets/RequestAssetPerm/RequestAssetPermTicketCreateUpdate'),
    //   meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: 'request-asset-perm/:id',
    //   name: 'AssetsTicketDetail',
    //   component: () => import('@/views/tickets/RequestAssetPerm/Detail'),
    //   meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: 'login-asset-confirm/:id',
    //   name: 'loginAssetTicketDetail',
    //   component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
    //   meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: 'request-application-perm/create',
    //   name: 'RequestApplicationPermTicketCreateUpdate',
    //   component: () => import('@/views/tickets/RequestApplicationPerm/RequestApplicationPermTicketCreateUpdate'),
    //   meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: 'request-application-perm/:id',
    //   name: 'AppsTicketDetail',
    //   component: () => import('@/views/tickets/RequestApplicationPerm/Detail'),
    //   meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: 'command-confirm/:id',
    //   name: 'CommandConfirmDetail',
    //   component: () => import('@/views/tickets/CommandConfirm/Detail'),
    //   meta: { title: i18n.t('route.CommandConfirm'), activeMenu: '/tickets/tickets', permissions: [] },
    //   hidden: true
    // },
    // {
    //   path: ':id',
    //   name: 'TicketDetail',
    //   component: () => import('@/views/tickets/TicketDetail'),
    //   meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [] },
    //   hidden: true
    // }
  ]
}

