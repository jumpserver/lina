import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default [
  {
    path: 'cloud',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.Cloud.Cloud') },
    children: [
      {
        path: '',
        component: () => import('@/views/xpack/Cloud/index.vue'),
        name: 'CloudCenter',
        meta: { title: i18n.t('xpack.Cloud.CloudCenter') }
      },
      {
        path: 'account',
        component: () => import('@/views/xpack/Cloud/Account/AccountList'),
        name: 'AccountList',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.AccountList') }
      },
      {
        path: 'account/create',
        component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
        name: 'AccountCreate',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.AccountCreate'), action: 'create', activeMenu: '/xpack/cloud' }
      },
      {
        path: 'account/:id/update',
        component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
        name: 'AccountUpdate',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.AccountUpdate'), action: 'update', activeMenu: '/xpack/cloud' }
      },
      {
        path: 'accounts/:id/',
        component: () => import('@/views/xpack/Cloud/Account/AccountDetail/index'),
        name: 'AccountDetail',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.AccountDetail'), activeMenu: '/xpack/cloud' }
      },
      {
        path: 'sync-instance-tasks',
        component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
        name: 'SyncInstanceTaskList',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskList'), activeMenu: '/xpack/cloud' }
      },
      {
        path: 'sync-instance-tasks/create',
        component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
        name: 'SyncInstanceTaskCreate',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate'), activeMenu: '/xpack/cloud' }
      },
      {
        path: 'sync-instance-tasks/:id/update',
        component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
        name: 'SyncInstanceTaskUpdate',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate'), activeMenu: '/xpack/cloud' }
      },
      {
        path: 'sync-instance-tasks/:id',
        component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskDetail/index'),
        name: 'SyncInstanceTaskDetail',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskDetail'), activeMenu: '/xpack/cloud' }
      }
    ]
  },
  {
    path: 'interface-setting',
    component: () => import('@/views/xpack/InterfaceSettings.vue'),
    name: 'InterfaceSetting',
    meta: { title: i18n.t('xpack.InterfaceSettings'), permissions: [rolec.PERM_SUPER] }
  },
  {
    path: 'orgs',
    component: empty,
    redirect: '',
    meta: { permissions: [rolec.PERM_SUPER] },
    children: [
      {
        path: '',
        component: () => import('@/views/xpack/Org/OrganizationList'),
        name: 'OrganizationList',
        meta: { title: i18n.t('xpack.Organization.OrganizationList'), activeMenu: '/xpack/orgs' }
      },
      {
        path: 'create',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationCreate',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationCreate'), activeMenu: '/xpack/orgs', action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationUpdate',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationUpdate'), activeMenu: '/xpack/orgs', action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/xpack/Org/OrganizationDetail/index'),
        name: 'OrganizationDetail',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationDetail'), activeMenu: '/xpack/orgs' }
      }
    ]
  },
  {
    path: 'system-monitor',
    component: () => import('@/views/xpack/SystemMonitor/index.vue'),
    name: 'SystemMonitor',
    meta: { title: i18n.t('xpack.SystemMonitor'), permissions: [rolec.PERM_SUPER] }
  }
]
