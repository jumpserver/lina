import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'account-discovery',
    component: empty,
    redirect: {
      name: 'AccountDiscoverList'
    },
    name: 'AccountDiscover',
    meta: {
      title: i18n.t('AccountDiscover'),
      app: 'accounts',
      icon: 'discovery'
      // activeMenu: '/console/accounts/automations',
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountDiscover/index.vue'),
        name: 'AccountDiscoverList',
        meta: {
          title: i18n.t('DiscoverAccounts'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_gatheredaccount']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountDiscover/TaskCreateUpdate'),
        name: 'AccountDiscoverTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountDiscoverTaskCreate'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.add_gatheraccountsautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountDiscover/TaskDetail/index'),
        name: 'AccountDiscoverTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('AccountDiscover'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_gatheraccountsautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountDiscover/TaskCreateUpdate'),
        name: 'AccountDiscoverTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountDiscoverTaskUpdate'),
          action: 'update',
          permissions: ['accounts.change_gatheraccountsautomation'],
          activeMenu: '/accounts/account-gather'
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountDiscover/TaskExecutionList.vue'),
        name: 'AccountDiscoverTaskExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionList'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_gatheraccountsexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountDiscover/ExecutionDetail/index.vue'),
        name: 'AccountDiscoverExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_gatheraccountsexecution']
        }
      },
      {
        path: 'account/:id',
        component: () => import('@/views/accounts/AccountDiscover/AccountDetail/index.vue'),
        name: 'AccountDiscoverAccountDetail',
        hidden: true,
        meta: {
          title: i18n.t('AccountDiscoverAccountDetail'),
          permissions: ['accounts.view_gatheraccountsexecution']
        }
      }
    ]
  },
  {
    path: 'account-change-secret',
    name: 'AccountChangeSecret',
    component: empty,
    redirect: {
      name: 'AccountChangeSecretList'
    },
    meta: {
      title: i18n.t('BaseAccountChangeSecret'),
      icon: 'change-password',
      app: 'accounts'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          menuTitle: i18n.t('ChangeSecret'),
          title: i18n.t('ChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretCreate',
        hidden: true,
        meta: {
          title: i18n.t('AssetChangeSecretCreate'),
          permissions: ['accounts.add_changesecretautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AssetChangeSecretUpdate'),
          permissions: ['accounts.change_changesecretautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountChangeSecret/Detail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('ChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountChangeSecret/Executions/AccountChangeSecretExecutionList.vue'),
        name: 'AccountChangeSecretExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionList'),
          permissions: ['accounts.view_changesecretexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/ExecutionDetail/index.vue'),
        name: 'AccountChangeSecretExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          permissions: ['accounts.view_changesecretexecution']
        }
      }
    ]
  },
  {
    path: 'account-push',
    name: 'AccountPush',
    component: empty,
    redirect: {
      name: 'AccountPushList'
    },
    meta: {
      app: 'accounts',
      name: 'BaseAccountPushList',
      resource: 'pushaccountautomation',
      icon: 'push'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountPush/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('AccountPushList'),
          menuTitle: i18n.t('AccountPushList'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushCreate'),
          permissions: ['accounts.add_pushaccountautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushUpdate'),
          permissions: ['accounts.change_pushaccountautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountPush/Detail/index.vue'),
        name: 'AccountPushDetail',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushList'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue'),
        name: 'AccountPushExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionList'),
          permissions: ['accounts.view_pushaccountexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountPush/ExecutionDetail/index.vue'),
        name: 'AccountPushExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          permissions: ['accounts.view_pushaccountexecution']
        }
      }]
  },
  {
    path: 'account-backup',
    component: empty,
    name: 'AccountBackup',
    redirect: {
      name: 'AccountBackupList'
    },
    meta: {
      title: i18n.t('AccountBackup'),
      app: 'accounts',
      icon: 'backup',
      resource: 'accountbackupautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackup/index.vue'),
        name: 'AccountBackupList',
        meta: {
          menuTitle: i18n.t('AccountBackup'),
          title: i18n.t('AccountBackupList'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_accountbackupautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
        name: 'AccountBackupCreate',
        meta: {
          title: i18n.t('AccountBackupCreate'),
          // activeMenu: '/console/accounts/automations',
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
        name: 'AccountBackupUpdate',
        meta: {
          title: i18n.t('AccountBackupUpdate'),
          // activeMenu: '/console/accounts/automations',
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountBackup/Detail/index.vue'),
        name: 'AccountBackupDetail',
        meta: {
          title: i18n.t('AccountBackupDetail')
        },
        hidden: true
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountBackup/Executions/AccountBackupExecutionList.vue'),
        name: 'AccountBackupExecutionList',
        meta: { title: i18n.t('ExecutionDetail') },
        hidden: true
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountBackup/Executions/ExecutionDetail/index.vue'),
        name: 'AccountBackupExecutionDetail',
        meta: { title: i18n.t('ExecutionDetail') },
        hidden: true
      }
    ]
  }
]
