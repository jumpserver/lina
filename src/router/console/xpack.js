import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

const activateMenu = '/console/assets/assets'

export default [
  {
    path: 'cloud',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('xpack.Cloud.CloudSync'),
      app: 'xpack',
      resource: 'account'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/assets/Cloud'),
        name: 'CloudCenter',
        hidden: true,
        meta: {
          title: i18n.t('xpack.Cloud.CloudSync'),
          activeMenu: activateMenu
        }
      },
      {
        path: 'account',
        component: empty,
        hidden: true,
        meta: {
          title: i18n.t('xpack.Cloud.AccountList'),
          permissions: ['xpack.view_account']
        },
        children: [
          {
            path: '',
            component: () => import('@/views/assets/Cloud/'),
            name: 'AccountList',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountList'),
              permissions: ['xpack.view_account'],
              hidden: true
            }
          },
          {
            path: 'create',
            component: () => import('@/views/assets/Cloud/Account/AccountCreateUpdate'),
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
            component: () => import('@/views/assets/Cloud/Account/AccountCreateUpdate'),
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
            component: () => import('@/views/assets/Cloud/Account/AccountDetail/index'),
            name: 'AccountDetail',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.AccountDetail'),
              activeMenu: activateMenu,
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
            component: () => import('@/views/assets/Cloud/'),
            name: 'SyncInstanceTaskList',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskList'),
              permissions: ['xpack.view_syncinstancetask']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/assets/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskCreate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate'),
              permissions: ['xpack.add_syncinstancetask']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/assets/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
            name: 'SyncInstanceTaskUpdate',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate'),
              permissions: ['xpack.change_syncinstancetask']
            }
          },
          {
            path: ':id',
            component: () => import('@/views/assets/Cloud/SyncInstanceTask/SyncInstanceTaskDetail/index'),
            name: 'SyncInstanceTaskDetail',
            hidden: true,
            meta: {
              title: i18n.t('xpack.Cloud.SyncInstanceTaskDetail'),
              activeMenu: activateMenu
            }
          }
        ]
      }
    ]
  }
]
