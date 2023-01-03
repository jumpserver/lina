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
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: {
          title: i18n.t('route.AssetAccount'),
          app: 'accounts',
          permissions: ['accounts.view_account']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountDetail/index.vue'),
        name: 'AssetAccountDetail',
        meta: { title: i18n.t('route.AssetAccount') },
        hidden: true
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
    path: 'account-gather',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('xpack.GatherUser.GatherUserList'),
      app: 'accounts',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountGather/index.vue'),
        name: 'AccountGatherIndex',
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskList'),
          permissions: ['accounts.view_gatheraccountsautomation']
        }
      },
      {
        path: 'automation',
        component: () => import('@/views/accounts/AccountGather/AccountGatherTaskList.vue'),
        name: 'AccountGatherTaskList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskList'),
          permissions: ['accounts.view_gatheraccountsautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'),
          permissions: ['accounts.add_gatheraccountsautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/index'),
        name: 'AccountGatherTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'),
          permissions: ['accounts.view_gatheraccountsautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'),
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
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionList'),
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
      title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'),
      app: 'accounts',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'AccountChangeSecretIndex',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'automation',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretList.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['accounts.view_changesecretautomation']
        },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanCreate'),
          permissions: ['accounts.add_changesecretautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanUpdate'),
          permissions: ['accounts.change_changesecretautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'executions',
        component: () => import(
          '@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/' +
          'AccountChangeSecretExecutionList.vue'
          ),
        name: 'AccountChangeSecretExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionList'),
          permissions: ['accounts.view_changesecretexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionDetail/index.vue'),
        name: 'AccountChangeSecretExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'),
          permissions: ['accounts.view_changesecretexecution']
        }
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
        name: 'AccountPushIndex',
        meta: {
          title: i18n.t('accounts.AccountPush.AccountPushList'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'automation',
        component: () => import('@/views/accounts/AccountPush/AccountPushList.vue'),
        name: 'AccountPushList',
        hidden: true,
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
        path: 'executions',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue'),
        name: 'AccountPushExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.AccountPush.ExecutionList'),
          permissions: ['accounts.view_pushaccountexecution']
        }
      }
    ]
  },
  {
    path: 'account-backup',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'),
      app: 'accounts',
      resource: 'accountbackupautomation',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackupPlan/index.vue'),
        name: 'AccountBackupIndex',
        meta: {
          title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'),
          permissions: ['accounts.view_accountbackupautomation']
        }
      },
      {
        path: 'automation',
        hidden: true,
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanList.vue'),
        name: 'AccountBackupPlanList',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan') }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanCreateUpdate.vue'),
        name: 'AccountBackupPlanCreate',
        meta: {
          title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlanCreate'),
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanCreateUpdate.vue'),
        name: 'AccountBackupPlanUpdate',
        meta: {
          title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlanUpdate'),
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanDetail/index.vue'),
        name: 'AccountBackupPlanDetail',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan') },
        hidden: true
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanDetail/AccountBackupPlanExecution/AccountBackupPlanExecutionDetail/index.vue'),
        name: 'AccountBackupPlanExecutionList',
        meta: { title: i18n.t('xpack.AccountBackupPlan.ExecutionDetail') },
        hidden: true
      }
    ]
  }
]
