import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

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
            meta: {
              title: i18n.t('xpack.Cloud.AccountCreate'),
              action: 'create'
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
            name: 'AccountUpdate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountUpdate'),
              action: 'update'
            }
          },
          {
            path: ':id/',
            component: () => import('@/views/xpack/Cloud/Account/AccountDetail/index'),
            name: 'AccountDetail',
            hidden: true,
            meta: { title: i18n.t('xpack.Cloud.AccountDetail') }
          }
        ]
      },
      {
        path: 'sync-instance-tasks',
        component: empty,
        hidden: true,
        meta: {
          title: i18n.t('xpack.Cloud.SyncInstanceTaskList')
        },
        children: [
          {
            path: '',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
            name: 'SyncInstanceTaskList',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskList')
            }
          },
          {
            path: 'create',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskCreate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate')
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskUpdate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate')
            }
          },
          {
            path: ':id',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskDetail/index'),
            name: 'SyncInstanceTaskDetail',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskDetail')
            }
          }
        ]
      }
    ]
  },
  {
    path: 'interface-setting',
    component: () => import('@/views/xpack/InterfaceSettings.vue'),
    name: 'InterfaceSetting',
    meta: { title: i18n.t('xpack.InterfaceSettings'), permissions: [] }
  },
  {
    path: 'orgs',
    component: empty,
    redirect: '',
    meta: { permissions: [] },
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
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationCreate'), action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationUpdate',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationUpdate'), action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/xpack/Org/OrganizationDetail/index'),
        name: 'OrganizationDetail',
        hidden: true,
        meta: { title: i18n.t('xpack.Organization.OrganizationDetail') }
      }
    ]
  },
  {
    path: 'system-monitor',
    component: () => import('@/views/xpack/SystemMonitor/index.vue'),
    name: 'SystemMonitor',
    meta: { title: i18n.t('xpack.SystemMonitor'), permissions: [] }
  }
]
