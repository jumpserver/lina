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
    path: 'gathered-user',
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
        component: () => import('@/views/accounts/AccountGather/index'),
        name: 'GatherUserListIndex',
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUser'),
          permissions: ['assets.view_gathereduser|xpack.view_gatherusertask']
        }
      },
      {
        path: '',
        component: () => import('@/views/accounts/AccountGather/GatheredUserList'),
        name: 'GatherUserList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserList'),
          activeMenu: '/accounts/gathered-user'
        }
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'GatherUserTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'),
          permissions: ['assets.add_gatheraccountsautomation']
        }
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/AccountGather/TaskDetail/index'),
        name: 'GatherUserTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'),
          permissions: ['assets.view_gatheraccountsautomation']
        }
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
        name: 'GatherUserTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'),
          action: 'update',
          permissions: ['assets.change_gatheraccountsautomation'],
          activeMenu: '/accounts/gathered-user'
        }
      }
    ]
  },
  {
    path: 'change-secret-automation',
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
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'ChangeSecretAutomationIndex',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'),
          permissions: ['assets.view_changesecretautomation']
        }
      },
      {
        path: 'atutomation',
        component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationList.vue'),
        name: 'ChangeSecretAutomationList',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['assets.view_changesecretautomation']
        },
        hidden: true
      },
      {
        path: 'atutomation/create',
        component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationCreateUpdate.vue'),
        name: 'ChangeSecretAutomationCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanCreate'),
          permissions: ['assets.add_changesecretautomation']
        }
      },
      {
        path: 'atutomation/:id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationCreateUpdate.vue'),
        name: 'ChangeSecretAutomationUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanUpdate'),
          permissions: ['assets.change_changesecretautomation']
        }
      },
      {
        path: 'atutomation/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationDetail/index.vue'),
        name: 'ChangeSecretAutomationDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['assets.view_changesecretautomation']
        }
      },
      {
        path: 'execution/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationDetail/ChangeSecretAutomationExecution/ChangeSecretAutomationExecutionDetail/index.vue'),
        name: 'ChangeAuthPlanExecutionDetail',
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
