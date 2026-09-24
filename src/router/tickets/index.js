import Layout from '@/layout'
import { hasPermission } from '@/utils/jms/permission'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/tickets',
  redirect: () => ({
    name: hasPermission('tickets.view_ticket') ? 'MyTicketList' : 'WorkflowList'
  }),
  component: Layout,
  meta: {
    title: i18n.t('BaseTickets'),
    icon: 'ticket-list',
    view: 'tickets',
    type: 'view',
    showNavSwitcher: false,
    resource: 'ticket',
    licenseRequired: true,
    permissions: ['tickets.view_ticket | tickets.view_workflow']
  },
  children: [
    {
      path: '/tickets/my-tickets',
      name: 'MyTicketList',
      component: () => import('@/views/tickets/MyTicketList'),
      meta: {
        title: i18n.t('MyTickets'),
        icon: 'ticket-apply',
        showOrganization: false,
        permissions: ['tickets.view_ticket']
      }
    },
    {
      path: '/tickets/assigned-tickets',
      name: 'AssignedTicketList',
      component: () => import('@/views/tickets/AssignedTicketList'),
      meta: {
        title: i18n.t('AwaitingMyApproval'),
        icon: 'ticket-approval',
        showOrganization: false,
        permissions: ['tickets.view_ticket']
      }
    },
    {
      path: '/tickets/tickets',
      redirect: '',
      component: empty,
      hidden: true,
      meta: {
        title: i18n.t('Tickets'),
        icon: 'file-text-o',
        showOrganization: false
      },
      children: [
        {
          path: 'create',
          name: 'PluginTicketCreate',
          component: () => import('@/views/tickets/plugins/Create'),
          meta: {
            title: i18n.t('OpenTicket'),
            permissions: ['tickets.view_ticket'],
            activeMenu: '/tickets/my-tickets'
          },
          hidden: true
        },
        {
          path: 'request-host-perm/create',
          name: 'RequestAssetPermTicketCreateUpdate',
          component: () => import('@/views/tickets/RequestAssetPerm/CreateUpdate'),
          meta: {
            title: i18n.t('OpenTicket'),
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
            title: i18n.t('TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'login-host-confirm/:id',
          name: 'LoginAssetTicketDetail',
          component: () => import('@/views/tickets/LoginAssetConfirm/Detail'),
          meta: {
            title: i18n.t('TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'login-confirm/:id',
          name: 'LoginTicketDetail',
          component: () => import('@/views/tickets/LoginConfirm/Detail'),
          meta: {
            title: i18n.t('TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: 'command-confirm/:id',
          name: 'CommandConfirmDetail',
          component: () => import('@/views/tickets/CommandConfirm/Detail'),
          meta: {
            title: i18n.t('CommandConfirm'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        },
        {
          path: ':id',
          name: 'TicketDetail',
          component: () => import('@/views/tickets/TicketDetail'),
          meta: {
            title: i18n.t('TicketDetail'),
            permissions: ['tickets.view_ticket']
          },
          hidden: true
        }
      ]
    },
    {
      path: '/tickets/workflows',
      component: empty,
      meta: {
        title: i18n.t('WFWorkflows'),
        icon: 'ticket-flow',
        permissions: ['tickets.view_workflow'],
        resource: 'workflow'
      },
      children: [
        {
          path: '',
          name: 'WorkflowList',
          component: () => import('@/views/tickets/Workflow/List'),
          meta: { title: i18n.t('WFWorkflows'), permissions: ['tickets.view_workflow'] }
        },
        {
          path: 'create',
          name: 'WorkflowCreate',
          hidden: true,
          component: () => import('@/views/tickets/Workflow/Designer'),
          meta: { title: i18n.t('WFDesigner'), permissions: ['tickets.add_workflow'] }
        },
        {
          path: ':id',
          name: 'WorkflowDetail',
          hidden: true,
          component: () => import('@/views/tickets/Workflow/Designer'),
          meta: { title: i18n.t('WFDesigner'), permissions: ['tickets.view_workflow'] }
        }
      ]
    }
  ]
}
