import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'asset-accounts',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: { title: i18n.t('route.AssetAccount') }
      }
    ]
  },
  {
    path: 'application-accounts',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'ApplicationAccountList',
        component: () => import('@/views/accounts/ApplicationAccount/ApplicationAccountList'),
        meta: { title: i18n.t('route.ApplicationAccount') }
      }
    ]
  },
  {
    path: 'gathered-user',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.GatherUser.GatherUserList') },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/index'),
        name: 'GatherUserListIndex',
        meta: { title: i18n.t('xpack.GatherUser.GatherUser'), activeMenu: '/accounts/gathered-user' }
      },
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/GatheredUserList'),
        name: 'GatherUserList',
        hidden: true,
        meta: { title: i18n.t('xpack.GatherUser.GatherUserList'), activeMenu: '/accounts/gathered-user' }
      },
      {
        path: 'tasks',
        component: () => import('@/views/accounts/GatheredUser/TaskList'),
        name: 'GatherUserTaskList',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskList'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/GatheredUser/TaskDetail/index'),
        name: 'GatherUserTaskDetail',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskCreate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskUpdate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'), action: 'update', activeMenu: '/accounts/gathered-user' },
        hidden: true
      }
    ]
  },
  {
    path: 'change-auth-plan',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan') },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/ChangeAuthPlan/index.vue'),
        name: 'ChangeAuthPlanIndex',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/accounts/change-auth-plan' }
      },
      {
        path: 'plan',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanList.vue'),
        name: 'AssetChangeAuthPlanList',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      },
      {
        path: 'plan/create',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'AssetChangeAuthPlanCreate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanCreate'), activeMenu: '/accounts/change-auth-plan', action: 'create' },
        hidden: true
      },
      {
        path: 'plan/:id/update',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'AssetChangeAuthPlanUpdate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlanUpdate'), activeMenu: '/accounts/change-auth-plan', action: 'update' },
        hidden: true
      },
      {
        path: 'plan/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
        name: 'AssetChangeAuthPlanDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      },
      {
        path: 'plan-execution/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/index.vue'),
        name: 'ChangeAuthPlanExecutionDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      },
      {
        path: 'app-plan',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanList.vue'),
        name: 'AppChangeAuthPlanList',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlan'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      },
      {
        path: 'app-plan/create',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanCreateUpdate.vue'),
        name: 'AppChangeAuthPlanCreate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlanCreate'), activeMenu: '/accounts/change-auth-plan', action: 'create' },
        hidden: true
      },
      {
        path: 'app-plan/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
        name: 'AppChangeAuthPlanDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlan'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      },
      {
        path: 'app-plan/:id/update',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanCreateUpdate.vue'),
        name: 'AppChangeAuthPlanUpdate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.AppChangeAuthPlanUpdate'), activeMenu: '/accounts/change-auth-plan', action: 'update' },
        hidden: true
      },
      {
        path: 'app-plan-execution/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/ChangeAuthPlanDetail/AppChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/index.vue'),
        name: 'AppChangeAuthPlanExecutionDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'), activeMenu: '/accounts/change-auth-plan' },
        hidden: true
      }
    ]
  },
  {
    path: 'backup',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan') },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackupPlan/index.vue'),
        name: 'AccountBackupPlanIndex',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'), activeMenu: '/accounts/backup' }
      },
      {
        path: '',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanList.vue'),
        name: 'AccountBackupPlanList',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'), activeMenu: '/accounts/backup' },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanCreateUpdate.vue'),
        name: 'AccountBackupPlanCreate',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlanCreate'), activeMenu: '/accounts/backup', action: 'create' },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanCreateUpdate.vue'),
        name: 'AccountBackupPlanUpdate',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlanUpdate'), activeMenu: '/accounts/backup', action: 'update' },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanDetail/index.vue'),
        name: 'AccountBackupPlanDetail',
        meta: { title: i18n.t('xpack.AccountBackupPlan.AccountBackupPlan'), activeMenu: '/accounts/backup' },
        hidden: true
      },
      {
        path: 'plan-execution/:id',
        component: () => import('@/views/accounts/AccountBackupPlan/AccountBackupPlanDetail/AccountBackupPlanExecution/AccountBackupPlanExecutionDetail/index.vue'),
        name: 'AccountBackupPlanExecutionDetail',
        meta: { title: i18n.t('xpack.AccountBackupPlan.ExecutionDetail'), activeMenu: '/accounts/backup' },
        hidden: true
      }
    ]
  }
]
