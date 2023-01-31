import Layout from '@/layout'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/tickets',
  redirect: '/tickets/my-tickets',
  component: Layout,
  meta: {
    title: i18n.t('route.Tickets'),
    icon: 'ticket-list',
    view: 'tickets',
    type: 'view',
    showNavSwitcher: false,
    resource: 'ticket',
    licenseRequired: true,
    permissions: ['tickets.view_ticket']
  },
  children: [
    {
      path: '/tickets/my-tickets',
      name: 'MyTicketList',
      component: () => import('@/views/tickets/MyTicketList'),
      meta: {
        title: i18n.t('route.MyTickets'),
        icon: 'ticket-apply',
        showOrganization: false,
        permissions: []
      }
    },
    {

      path: '/tickets/assigned-tickets',
      name: 'AssignedTicketList',
      component: () => import('@/views/tickets/AssignedTicketList'),
      meta: {
        title: i18n.t('route.AssignedTicketList'),
        icon: 'ticket-approval',
        showOrganization: false,
        permissions: []
      }
    },
    {
      path: '/tickets/tickets',
      redirect: '',
      component: empty,
      hidden: true,
      meta: {
        title: i18n.t('route.Tickets'),
        icon: 'file-text-o',
        showOrganization: false
      },
      children: [
        {
          path: 'request-host-perm/create',
          name: 'RequestAssetPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestAssetPerm/CreateUpdate'),
          meta: {
            title: i18n.t('tickets.OpenTicket'),
            permissions: ['tickets.view_ticket'],
            activeMenu: '/tickets/my-tickets'
          },
          hidden: true
        },
        {
          path: 'request-host-perm/:id',
          name: 'AssetsTicketDetail',
          component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'login-host-confirm/:id',
          name: 'LoginAssetTicketDetail',
          component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
          meta: {
            title: i18n.t('route.TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'login-confirm/:id',
          name: 'LoginTicketDetail',
          component: () => import('@/views/tickets/LoginConfirm/Detail'),
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
        icon: 'ticket-flow',
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
            permissions: ['tickets.view_ticketflow'],
            activeMenu: '/tickets/flow'
          }
        },
        {
          path: ':id',
          name: 'FlowDetail',
          component: () => import('@/views/tickets/TicketFlow/Detail'),
          meta: {
            title: i18n.t('route.TicketFlow'),
            permissions: ['tickets.view_ticketflow'],
            activeMenu: '/tickets/flow'
          },
          hidden: true
        },
        {
          path: 'create',
          name: 'TicketFlowCreate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowCreate'),
            permissions: ['tickets.add_ticketflow'],
            activeMenu: '/tickets/flow'
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TicketFlowUpdate',
          component: () => import('@/views/tickets/TicketFlow/FlowCreateUpdate'),
          meta: {
            title: i18n.t('route.TicketFlowUpdate'),
            permissions: ['tickets.change_ticketflow'],
            activeMenu: '/tickets/flow'
          },
          hidden: true
        }
      ]
    }
  ]
}

