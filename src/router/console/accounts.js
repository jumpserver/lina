import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'authbook',
    component: empty,
    meta: {
      title: i18n.t('route.AssetAccount'),
      app: 'assets',
      licenseRequired: true
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
          permissions: ['assets.view_authbook']
        }
      }
    ]
  },
  {
    path: 'application-accounts',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.AssetAccount'),
      permissions: ['applications.view_account'],
      app: 'applications',
      resource: 'account',
      licenseRequired: true
    },
    children: [
      {
        path: '',
        name: 'ApplicationAccountList',
        component: () => import('@/views/accounts/ApplicationAccount/ApplicationAccountList'),
        meta: {
          title: i18n.t('route.ApplicationAccount'),
          permissions: ['applications.view_account'],
          resource: 'account'
        }
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
        component: () => import('@/views/accounts/GatheredUser/index'),
        name: 'GatherUserListIndex',
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUser'),
          permissions: ['assets.view_gathereduser|xpack.view_gatherusertask']
        }
      },
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/GatheredUserList'),
        name: 'GatherUserList',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserList'),
          activeMenu: '/accounts/gathered-user'
        }
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/GatheredUser/TaskDetail/index'),
        name: 'GatherUserTaskDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'),
          permissions: ['xpack.view_gatherusertask']
        }
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'),
          permissions: ['xpack.add_gatherusertask']
        }
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'),
          action: 'update',
          permissions: ['xpack.change_gatherusertask'],
          activeMenu: '/accounts/gathered-user'
        }
      }
    ]
  },
  {
    path: 'change-auth-plan',
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
        component: () => import('@/views/accounts/ChangeAuthPlan/index.vue'),
        name: 'ChangeAuthPlanIndex',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'),
          permissions: ['xpack.view_changeauthplan|xpack.view_applicationchangeauthplan']
        }
      },
      {
        path: 'plan',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanList.vue'),
        name: 'AssetChangeAuthPlanList',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['xpack.view_changeauthplan']
        },
        hidden: true
      },
      {
        path: 'plan/create',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'AssetChangeAuthPlanCreate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanCreate'),
          permissions: ['xpack.add_changeauthplan']
        }
      },
      {
        path: 'plan/:id/update',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'AssetChangeAuthPlanUpdate',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanUpdate'),
          permissions: ['xpack.change_changeauthplan']
        }
      },
      {
        path: 'plan/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
        name: 'AssetChangeAuthPlanDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
          permissions: ['xpack.view_changeauthplan']
        }
      },
      {
        path: 'plan-execution/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/index.vue'),
        name: 'ChangeAuthPlanExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'),
          permissions: ['xpack.view_changeauthplanexecution']
        }
      },
      {
        path: 'app-plan',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanList.vue'),
        name: 'AppChangeAuthPlanList',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlan'),
          permissions: ['xpack.view_applicationchangeauthplan']
        },
        hidden: true
      },
      {
        path: 'app-plan/create',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanCreateUpdate.vue'),
        name: 'AppChangeAuthPlanCreate',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlanCreate'),
          permissions: ['xpack.add_applicationchangeauthplan']
        },
        hidden: true
      },
      {
        path: 'app-plan/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
        name: 'AppChangeAuthPlanDetail',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlan'),
          permissions: ['xpack.view_applicationchangeauthplan']
        },
        hidden: true
      },
      {
        path: 'app-plan/:id/update',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanCreateUpdate.vue'),
        name: 'AppChangeAuthPlanUpdate',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlanUpdate'),
          permissions: ['xpack.change_applicationchangeauthplan']
        },
        hidden: true
      },
      {
        path: 'app-plan-execution/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/ChangeAuthPlanDetail/AppChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/index.vue'),
        name: 'AppChangeAuthPlanExecutionDetail',
        meta: {
          title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'),
          permissions: ['xpack.view_applicationchangeauthplanexecution']
        },
        hidden: true
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
