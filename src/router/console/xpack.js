import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'cloud',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('xpack.Cloud.Cloud'),
      permissions: ['xpack.view_account']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/xpack/Cloud/index.vue'),
        name: 'CloudCenter',
        meta: {
          title: i18n.t('xpack.Cloud.CloudCenter'),
          permissions: ['xpack.view_account']
        }
      },
      {
        path: 'account',
        component: empty,
        name: 'AccountList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.Cloud.AccountList'),
          permissions: ['xpack.view_account']
        },
        children: [
          {
            path: '',
            component: () => import('@/views/xpack/Cloud/Account/AccountList'),
            name: 'AccountList',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountList'),
              permissions: ['xpack.view_account']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
            name: 'AccountCreate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountCreate'),
              action: 'create',
              permissions: ['xpack.add_account']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
            name: 'AccountUpdate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountUpdate'),
              action: 'update',
              permissions: ['xpack.change_account']
            }
          },
          {
            path: ':id/',
            component: () => import('@/views/xpack/Cloud/Account/AccountDetail/index'),
            name: 'AccountDetail',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountDetail'),
              permissions: ['xpack.view_account']
            }
          }
        ]
      },
      {
        path: 'sync-instance-tasks',
        component: empty,
        hidden: true,
        meta: {
          title: i18n.t('xpack.Cloud.SyncInstanceTaskList'),
          permissions: ['xpack.view_syncinstancetask']
        },
        children: [
          {
            path: '',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
            name: 'SyncInstanceTaskList',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskList'),
              permissions: ['xpack.view_syncinstancetask']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskCreate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate'),
              permissions: ['xpack.add_syncinstancetask']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskUpdate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate'),
              permissions: ['xpack.change_syncinstancetask']
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
    meta: {
      title: i18n.t('xpack.InterfaceSettings'),
      permissions: ['xpack.view_interface']
    }
  },
  {
    path: 'orgs',
    component: empty,
    redirect: '',
    meta: { permissions: ['orgs.view_organization'] },
    children: [
      {
        path: '',
        component: () => import('@/views/xpack/Org/OrganizationList'),
        name: 'OrganizationList',
        meta: {
          title: i18n.t('xpack.Organization.OrganizationList'),
          permissions: ['orgs.view_organization']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.Organization.OrganizationCreate'),
          action: 'create',
          permissions: ['orgs.add_organization']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
        name: 'OrganizationUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.Organization.OrganizationUpdate'),
          action: 'update',
          permissions: ['orgs.change_organization']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/xpack/Org/OrganizationDetail/index'),
        name: 'OrganizationDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.Organization.OrganizationDetail'),
          permissions: ['orgs.view_organization']
        }
      }
    ]
  },
  {
    path: 'system-monitor',
    component: () => import('@/views/xpack/SystemMonitor/index.vue'),
    name: 'SystemMonitor',
    meta: { title: i18n.t('xpack.SystemMonitor'), permissions: ['terminal.view_terminal'] }
  }
]
