import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'accounts',
    component: empty,
    meta: {
      title: i18n.t('route.AssetAccount'),
      app: 'accounts',
      permissions: ['accounts.view_account']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/Account/index.vue'),
        meta: {
          title: i18n.t('route.AssetAccount'),
          app: 'accounts',
          permissions: ['accounts.view_account']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/Account/AccountDetail/index.vue'),
        name: 'AssetAccountDetail',
        meta: { title: i18n.t('route.AssetAccountDetail') },
        hidden: true
      }
    ]
  },
  {
    path: 'virtual-accounts',
    component: empty,
    meta: {
      title: i18n.t('route.VirtualAccount'),
      app: 'accounts',
      permissions: ['accounts.view_virtualaccount']
    },
    hidden: true,
    redirect: '/console/accounts/accounts',
    children: [
      {
        path: ':id/update',
        component: () => import('@/views/accounts/VirtualAccount/VirtualUpdate.vue'),
        name: 'VirtualAccountUpdate',
        meta: {
          title: i18n.t('route.VirtualAccountUpdate'),
          activeMenu: '/console/accounts/accounts',
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/VirtualAccount/VirtualDetail/index.vue'),
        name: 'VirtualAccountDetail',
        meta: {
          title: i18n.t('route.VirtualAccountDetail'),
          activeMenu: '/console/accounts/accounts'
        }
      }
    ]
  },
  {
    path: 'account-template',
    component: empty,
    meta: {
      title: i18n.t('route.AccountTemplate'),
      app: 'accounts',
      permissions: ['accounts.view_accounttemplate']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AccountTemplateList',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateList'),
        meta: {
          title: i18n.t('route.AccountTemplate'),
          permissions: ['accounts.view_accounttemplate']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateCreate',
        meta: {
          title: i18n.t('route.CreateAccountTemplate'),
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateUpdate',
        meta: {
          title: i18n.t('route.UpdateAccountTemplate'),
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateDetail/index.vue'),
        name: 'AccountTemplateDetail',
        meta: { title: i18n.t('route.AccountTemplate') },
        hidden: true
      }
    ]
  },
  {
    path: 'account-push',
    component: empty,
    redirect: '',
    meta: {
      app: 'accounts',
      name: 'AccountPushList',
      resource: 'pushaccountautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountPush/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('accounts.AccountPush.AccountPushList'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushCreate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountPush.AccountPushCreate'),
          permissions: ['accounts.add_pushaccountautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushUpdate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountPush.AccountPushUpdate'),
          permissions: ['accounts.change_pushaccountautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountPush/AccountPushDetail/index.vue'),
        name: 'AccountPushDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountPush.AccountPushList'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue'),
        name: 'AccountPushExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.AccountPush.ExecutionList'),
          permissions: ['accounts.view_pushaccountexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionDetail/index.vue'),
        name: 'AccountPushExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.ExecutionDetail'),
          permissions: ['accounts.view_pushaccountexecution']
        }
      }
    ]
  },
  {
    path: 'account-gather',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('accounts.AccountGather.AccountGatherList'),
      app: 'accounts',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountGather/index.vue'),
        name: 'AccountGatherList',
        meta: {
          title: i18n.t('accounts.AccountGather.AccountGatherTaskList'),
          permissions: ['accounts.view_gatheredaccount']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountGather.AccountGatherTaskCreate'),
          permissions: ['accounts.add_gatheraccountsautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/index'),
        name: 'AccountGatherTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountGather.AccountGatherTaskDetail'),
          permissions: ['accounts.view_gatheraccountsautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountGather.AccountGatherTaskUpdate'),
          action: 'update',
          permissions: ['accounts.change_gatheraccountsautomation'],
          activeMenu: '/accounts/account-gather'
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/TaskExecutionList.vue'),
        name: 'AccountGatherTaskExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountGather.ExecutionList'),
          permissions: ['accounts.view_gatheraccountsexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/AccountGatherExecutionDetail/index.vue'),
        name: 'AccountGatherExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountGather.ExecutionDetail'),
          permissions: ['accounts.view_gatheraccountsexecution']
        }
      }
    ]
  },
  {
    path: 'account-change-secret',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('accounts.AccountChangeSecret.AccountChangeSecret'),
      app: 'accounts',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.AccountChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretCreate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.AssetChangeSecretCreate'),
          permissions: ['accounts.add_changesecretautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretUpdate',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.AssetChangeSecretUpdate'),
          permissions: ['accounts.change_changesecretautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.AccountChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionList.vue'),
        name: 'AccountChangeSecretExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.ExecutionList'),
          permissions: ['accounts.view_changesecretexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionDetail/index.vue'),
        name: 'AccountChangeSecretExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('accounts.AccountChangeSecret.ExecutionDetail'),
          permissions: ['accounts.view_changesecretexecution']
        }
      }
    ]
  },
  {
    path: 'account-backup',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('accounts.AccountBackup.AccountBackup'),
      app: 'accounts',
      resource: 'accountbackupautomation',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackup/index.vue'),
        name: 'AccountBackupList',
        meta: {
          title: i18n.t('accounts.AccountBackup.AccountBackup'),
          permissions: ['accounts.view_accountbackupautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
        name: 'AccountBackupPlanCreate',
        meta: {
          title: i18n.t('accounts.AccountBackup.AccountBackupCreate'),
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
        name: 'AccountBackupPlanUpdate',
        meta: {
          title: i18n.t('accounts.AccountBackup.AccountBackupUpdate'),
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/index.vue'),
        name: 'AccountBackupPlanDetail',
        meta: { title: i18n.t('accounts.AccountBackup.AccountBackup') },
        hidden: true
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/AccountBackupExecution/AccountBackupExecutionList.vue'),
        name: 'AccountBackupPlanExecutionList',
        meta: { title: i18n.t('accounts.AccountBackup.ExecutionDetail') },
        hidden: true
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/AccountBackupExecution/AccountBackupExecutionDetail/index.vue'),
        name: 'AccountBackupPlanExecutionDetail',
        meta: { title: i18n.t('accounts.AccountBackup.ExecutionDetail') },
        hidden: true
      }
    ]
  }
]
