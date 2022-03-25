import Layout from '@/layout'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/tickets',
  redirect: '/tickets/tickets',
  component: Layout,
  meta: {
    title: i18n.t('route.Tickets'),
    icon: 'check-square-o',
    view: 'tickets',
    type: 'view',
    showNavSwitcher: false,
    resource: 'ticket',
    licenseRequired: true,
    permissions: ['tickets.view_ticket']
  },
  children: [
    {
      path: '/tickets/tickets',
      redirect: '',
      component: empty,
      meta: {
        title: i18n.t('route.Tickets'),
        icon: 'file-text-o',
        showOrganization: false
      },
      children: [
        {
          path: '',
          name: 'TicketList',
          component: () => import('@/views/tickets'),
          meta: {
            title: i18n.t('route.Tickets'),
            icon: 'file-text-o',
            permissions: ['tickets.view_ticket']
          }
        },
        {
          path: 'request-asset-perm/create',
          name: 'RequestAssetPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestAssetPerm/CreateUpdate'),
          meta: {
            title: i18n.t('tickets.OpenTicket'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'request-asset-perm/:id',
          name: 'AssetsTicketDetail',
          component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'login-asset-confirm/:id',
          name: 'LoginAssetTicketDetail',
          component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'request-application-perm/create',
          name: 'RequestApplicationPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestApplicationPerm/CreateUpdate'),
          meta: {
            title: i18n.t('route.TicketCreate'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'request-application-perm/:id',
          name: 'AppsTicketDetail',
          component: () => import('@/views/tickets/RequestApplicationPerm/Detail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'command-confirm/:id',
          name: 'CommandConfirmDetail',
          component: () => import('@/views/tickets/CommandConfirm/Detail'),
          meta: {
            title: i18n.t('route.CommandConfirm'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: ':id',
          name: 'TicketDetail',
          component: () => import('@/views/tickets/TicketDetail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        }
      ]
    },
    {
      path: '/tickets/flow',
      component: empty,
      redirect: '',
      meta: {
        title: i18n.t('tickets.FlowSetUp'),
        icon: 'sort-amount-asc',
        permissions: ['tickets.view_ticketflow'],
        resource: 'ticketflow'
      },
      children: [
        {
          path: '',
          name: 'TicketFlow',
          component: () => import('@/views/tickets/TicketFlow/TicketFlow'),
          meta: {
            title: i18n.t('tickets.FlowSetUp'),
            permissions: ['tickets.view_ticketflow']
          }
        },
        {
          path: ':id',
          name: 'FlowDetail',
          component: () => import('@/views/tickets/TicketFlow/Detail'),
          meta: {
            title: i18n.t('route.TicketFlow'),
            permissions: ['tickets.view_ticketflow']
          },
          hidden: true
        },
        {
          path: 'create',
          name: 'TicketFlowCreate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowCreate'),
            permissions: ['tickets.add_ticketflow']
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TicketFlowUpdate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowUpdate'),
            permissions: ['tickets.change_ticketflow']
          },
          hidden: true
        }
      ]
    }
  ]
}

