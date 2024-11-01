import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'account-gather',
    component: empty,
    redirect: {
      name: 'AccountDiscoverList'
    },
    name: 'AccountDiscover',
    meta: {
      title: i18n.t('AccountDiscoverList'),
      app: 'accounts',
      icon: 'client'
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
          title: i18n.t('AccountDiscoverTaskDetail'),
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
        component: () => import('@/views/accounts/AccountDiscover/TaskDetail/TaskExecutionList.vue'),
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
      icon: 'basic',
      app: 'accounts'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          menuTitle: i18n.t('ChangeCredentials'),
          title: i18n.t('AccountChangeSecret'),
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
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('AccountChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionList.vue'),
        name: 'AccountChangeSecretExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionList'),
          permissions: ['accounts.view_changesecretexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionDetail/index.vue'),
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
    path: 'account-backup',
    component: empty,
    name: 'AccountBackup',
    redirect: {
      name: 'AccountBackupList'
    },
    meta: {
      title: i18n.t('AccountBackup'),
      app: 'accounts',
      icon: 'clean',
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
        component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/index.vue'),
        name: 'AccountBackupDetail',
        meta: {
          title: i18n.t('AccountBackupDetail'),
          activeMenu: '/console/accounts/automations'
        },
        hidden: true
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupExecution/AccountBackupExecutionList.vue'),
        name: 'AccountBackupExecutionList',
        meta: { title: i18n.t('ExecutionDetail') },
        hidden: true
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupExecution/AccountBackupExecutionDetail/index.vue'),
        name: 'AccountBackupExecutionDetail',
        meta: { title: i18n.t('ExecutionDetail') },
        hidden: true
      }
    ]
  }
]
