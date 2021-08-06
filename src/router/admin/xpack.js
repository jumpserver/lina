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
        component: empty,
        name: 'AccountList',
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.AccountList') },
        children: [
          {
            path: '',
            component: () => import('@/views/xpack/Cloud/Account/AccountList'),
            name: 'AccountList',
            hidden: true,
            meta: { title: i18n.t('xpack.Cloud.AccountList') }
          },
          {
            path: 'create',
            component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
            name: 'AccountCreate',
            hidden: true,
            meta: { title: i18n.t('xpack.Cloud.AccountCreate'), action: 'create', activeMenu: '/admin/xpack/cloud' }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
            name: 'AccountUpdate',
            hidden: true,
            meta: { title: i18n.t('xpack.Cloud.AccountUpdate'), action: 'update', activeMenu: '/admin/xpack/cloud' }
          },
          {
            path: ':id/',
            component: () => import('@/views/xpack/Cloud/Account/AccountDetail/index'),
            name: 'AccountDetail',
            hidden: true,
            meta: { title: i18n.t('xpack.Cloud.AccountDetail'), activeMenu: '/admin/xpack/cloud' }
          }
        ]
      },
      {
        path: 'sync-instance-tasks',
        component: empty,
        hidden: true,
        meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskList'), activeMenu: '/admin/xpack/cloud' },
        children: [
          {
            path: '',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
            name: 'SyncInstanceTaskList',
            meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskList'), activeMenu: '/admin/xpack/cloud', hidden: true }
          },
          {
            path: 'create',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskCreate',
            meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate'), activeMenu: '/admin/xpack/cloud', hidden: true }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskUpdate',
            meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate'), activeMenu: '/admin/xpack/cloud', hidden: true }
          },
          {
            path: ':id',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskDetail/index'),
            name: 'SyncInstanceTaskDetail',
            meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskDetail'), activeMenu: '/admin/xpack/cloud', hidden: true }
          }
        ]
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
        meta: { title: i18n.t('xpack.Organization.OrganizationList') }
      },
      {
        path: 'create',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationCreate',
        meta: { title: i18n.t('xpack.Organization.OrganizationCreate'), hidden: true, action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationUpdate',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationUpdate'), hidden: true, action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/xpack/Org/OrganizationDetail/index'),
        name: 'OrganizationDetail',
        meta: { title: i18n.t('xpack.Organization.OrganizationDetail'), hidden: true }
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
