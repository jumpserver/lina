import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'accounts',
    component: empty,
    meta: {
      title: i18n.t('route.AssetAccount'),
      app: 'assets',
      permissions: ['assets.view_account']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: {
          title: i18n.t('route.AssetAccount'),
          app: 'assets',
          permissions: ['assets.view_account']
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
      app: 'assets',
      permissions: ['assets.view_accounttemplate']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AccountTemplateList',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateList'),
        meta: {
          title: i18n.t('route.AccountTemplate'),
          permissions: ['assets.view_accounttemplate']
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
      app: 'assets',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountGather/AccountGatherTaskList.vue'),
        name: 'AccountGatherTaskList',
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskList'),
          permissions: ['assets.view_gatheraccountsautomation']
        }
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'),
          permissions: ['assets.add_gatheraccountsautomation']
        }
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/index'),
        name: 'AccountGatherTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'),
          permissions: ['assets.view_gatheraccountsautomation']
        }
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'AccountGatherTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'),
          action: 'update',
          permissions: ['assets.change_gatheraccountsautomation'],
          activeMenu: '/accounts/account-gather'
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
      app: 'xpack',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretList.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['assets.view_changesecretautomation']
        }
      },
      {
        path: 'automation/create',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanCreate'),
          permissions: ['assets.add_changesecretautomation']
        }
      },
      {
        path: 'automation/:id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanUpdate'),
          permissions: ['assets.change_changesecretautomation']
        }
      },
      {
        path: 'automation/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['assets.view_changesecretautomation']
        }
      },
      {
        path: 'account-change-secret-execution/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionDetail/index.vue'),
        name: 'AccountChangeSecretExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'),
          permissions: ['assets.view_automationexecution']
        }
      }
    ]
  },
  {
    path: 'backup',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'),
      app: 'assets',
      resource: 'accountbackupplan',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanList'),
        name: 'AccountBackupPlanIndex',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan') }
      },
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanList.vue'),
        name: 'AccountBackupPlanList',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan') },
        hidden: true
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
        path: 'plan-execution/:id',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanDetail/AccountBackupPlanExecution/AccountBackupPlanExecutionDetail/index.vue'),
        name: 'AccountBackupPlanExecutionDetail',
        meta: { title: i18n.t('xpack.AccountBackupPlan.ExecutionDetail') },
        hidden: true
      }
    ]
  }
]
