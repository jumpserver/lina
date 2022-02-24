import Layout from '@/layout'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/tickets',
  redirect: '/tickets/list',
  component: Layout,
  meta: {
    title: i18n.t('route.Tickets'),
    icon: 'check-square-o',
    view: 'tickets',
    type: 'view',
    showNavSwitcher: false,
    permissions: []
  },
  children: [
    {
      path: '/tickets/list',
      redirect: '',
      component: empty,
      meta: {
        title: i18n.t('route.Tickets'),
        icon: 'file-text-o',
        showOrganization: false,
        permissions: [],
        resource: 'terminal',
        app: 'terminal'
      },
      children: [
        {
          path: '',
          name: 'TicketList',
          component: () => import('@/views/tickets'),
          meta: {
            title: i18n.t('route.Tickets'),
            icon: 'file-text-o',
            permissions: [],
            resource: 'terminal',
            app: 'terminal'
          }
        },
        {
          path: 'request-asset-perm/create',
          name: 'RequestAssetPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestAssetPerm/CreateUpdate'),
          meta: {
            title: i18n.t('tickets.OpenTicket'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'request-asset-perm/:id',
          name: 'AssetsTicketDetail',
          component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'login-asset-confirm/:id',
          name: 'loginAssetTicketDetail',
          component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'request-application-perm/create',
          name: 'RequestApplicationPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestApplicationPerm/CreateUpdate'),
          meta: {
            title: i18n.t('route.TicketCreate'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'request-application-perm/:id',
          name: 'AppsTicketDetail',
          component: () => import('@/views/tickets/RequestApplicationPerm/Detail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'command-confirm/:id',
          name: 'CommandConfirmDetail',
          component: () => import('@/views/tickets/CommandConfirm/Detail'),
          meta: {
            title: i18n.t('route.CommandConfirm'),
            permissions: []
          },
          hidden: true
        },
        {
          path: ':id',
          name: 'TicketDetail',
          component: () => import('@/views/tickets/TicketDetail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: []
          },
          hidden: true
        }
      ]
    },
    {
      path: '/tickets/flow',
      name: 'TicketFlow',
      component: empty,
      redirect: '',
      meta: {
        title: i18n.t('tickets.FlowSetUp'),
        icon: 'sort-amount-asc',
        permissions: []
      },
      children: [
        {
          path: '',
          name: 'TicketFlow',
          component: () => import('@/views/tickets/TicketFlow/TicketFlow'),
          meta: {
            title: i18n.t('tickets.FlowSetUp'),
            permissions: [],
            resource: 'terminal',
            app: 'terminal'
          }
        },
        {
          path: ':id',
          name: 'FlowDetail',
          component: () => import('@/views/tickets/TicketFlow/Detail'),
          meta: {
            title: i18n.t('route.TicketFlow'),
            permissions: []
          },
          hidden: true
        },
        {
          path: 'create',
          name: 'TicketFlowCreate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowCreate'),
            permissions: []
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TicketFlowUpdate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowUpdate'),
            permissions: []
          },
          hidden: true
        }
      ]
    }
  ]
}

