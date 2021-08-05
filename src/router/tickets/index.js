import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default {
  path: '/tickets',
  redirect: '',
  component: Layout,
  meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
  children: [
    {
      path: '',
      name: 'TicketList',
      component: () => import('@/views/tickets/TicketList'),
      meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets', permissions: [rolec.PERM_USE] }
    },
    {
      path: 'request-asset-perm/create',
      name: 'RequestAssetPermTicketCreateUpdate',
      component: () => import('@/views/tickets/RequestAssetPerm/RequestAssetPermTicketCreateUpdate'),
      meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: 'request-asset-perm/:id',
      name: 'AssetsTicketDetail',
      component: () => import('@/views/tickets/RequestAssetPerm/Detail'),
      meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: 'login-asset-confirm/:id',
      name: 'loginAssetTicketDetail',
      component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
      meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: 'request-application-perm/create',
      name: 'RequestApplicationPermTicketCreateUpdate',
      component: () => import('@/views/tickets/RequestApplicationPerm/RequestApplicationPermTicketCreateUpdate'),
      meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: 'request-application-perm/:id',
      name: 'AppsTicketDetail',
      component: () => import('@/views/tickets/RequestApplicationPerm/Detail'),
      meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: 'command-confirm/:id',
      name: 'CommandConfirmDetail',
      component: () => import('@/views/tickets/CommandConfirm/Detail'),
      meta: { title: i18n.t('route.CommandConfirm'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    },
    {
      path: ':id',
      name: 'TicketDetail',
      component: () => import('@/views/tickets/TicketDetail'),
      meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
      hidden: true
    }
  ]
}

