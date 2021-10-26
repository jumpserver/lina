import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
import { BASE_URL } from '@/utils/common'

export default [
  // 404 page must be placed at the end !!!
  {
    path: '/',
    component: Layout,
    meta: {
      roles: [rolec.USER],
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: '',
        name: 'MyAssets',
        component: () => import('@/userviews/assets/index'),
        meta: {
          title: i18n.t('route.MyAssets'),
          icon: 'files-o',
          permissions: [rolec.PERM_USE]
        }
      }
    ]
  },
  {
    path: '/apps',
    name: 'Apps',
    component: Layout,
    redirect: '/apps/remoteapp',
    alwaysShow: true,
    meta: { title: i18n.t('route.MyApps'), icon: 'th', permissions: [rolec.PERM_USE] },
    children: [
      {
        path: '/apps/remoteapp',
        name: 'MyRemoteApps',
        component: () => import('@/userviews/apps/RemoteApp'),
        meta: { title: i18n.t('route.RemoteApp'), permissions: [rolec.PERM_USE], licenseRequired: true }
      },
      {
        path: '/apps/database',
        name: 'MyDatebases',
        component: () => import('@/userviews/apps/DatabaseApp'),
        meta: { title: i18n.t('route.DatabaseApp'), permissions: [rolec.PERM_USE] }
      },
      {
        path: '/apps/kubernetes',
        name: 'MyKubernetes',
        component: () => import('@/userviews/apps/KubernetesApp'),
        meta: { title: i18n.t('route.KubernetesApp'), permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: '/command-executions',
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE],
      hidden: ({ settings }) => !settings.SECURITY_COMMAND_EXECUTION
    },
    children: [
      {
        path: '',
        name: 'CommandExecutions',
        component: () => import('@/views/ops/CommandExecution'),
        meta: { title: i18n.t('route.BatchCommand'), icon: 'terminal', permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: '/tickets',
    component: Layout,
    hidden: true,
    meta: {
      title: i18n.t('route.Tickets'),
      icon: 'history',
      permissions: [rolec.PERM_USE],
      licenseRequired: true,
      hidden: ({ settings }) => {
        return !settings.TICKETS_ENABLED
      }
    },
    children: [
      {
        path: '',
        name: 'TicketList',
        component: () => import('@/views/tickets/TicketList'),
        meta: { title: i18n.t('route.Tickets'), icon: 'check-square-o', activeMenu: '/tickets', permissions: [rolec.PERM_USE] }
      },
      {
        path: 'tickets/request-asset-perm/create',
        name: 'RequestAssetPermTicketCreateUpdate',
        component: () => import('@/views/tickets/RequestAssetPerm/RequestAssetPermTicketCreateUpdate'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/request-asset-perm/:id',
        name: 'AssetsTicketDetail',
        component: () => import('@/views/tickets/RequestAssetPerm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/login-asset-confirm/:id',
        name: 'LoginAssetTicketDetail',
        component: () => import('@/views/tickets/LoginAssetConfirm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/request-application-perm/create',
        name: 'RequestApplicationPermTicketCreateUpdate',
        component: () => import('@/views/tickets/RequestApplicationPerm/RequestApplicationPermTicketCreateUpdate'),
        meta: { title: i18n.t('route.TicketCreate'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/request-application-perm/:id',
        name: 'AppsTicketDetail',
        component: () => import('@/views/tickets/RequestApplicationPerm/Detail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/command-confirm/:id',
        name: 'CommandConfirmDetail',
        component: () => import('@/views/tickets/CommandConfirm/Detail/index'),
        meta: { title: i18n.t('route.CommandConfirm'), activeMenu: '/tickets/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      },
      {
        path: 'tickets/:id',
        name: 'TicketDetail',
        component: () => import('@/views/tickets/TicketDetail/index'),
        meta: { title: i18n.t('route.TicketDetail'), activeMenu: '/tickets', permissions: [rolec.PERM_USE] },
        hidden: true
      }
    ]
  },
  {
    path: `external-luna`,
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: `${BASE_URL}/luna/`,
        meta: { title: i18n.t('route.WebTerminal'), icon: 'window-maximize', activeMenu: '/assets', permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: 'external-elfinder',
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: `${BASE_URL}/koko/elfinder/sftp/`,
        meta: { title: i18n.t('route.FileManager'), icon: 'file', activeMenu: '/assets', permissions: [rolec.PERM_USE] }
      }
    ]
  }
]
