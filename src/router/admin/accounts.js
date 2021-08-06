import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'asset-accounts',
    name: 'AssetAccountList',
    component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
    meta: { title: i18n.t('route.AssetAccount') }
  },
  {
    path: 'application-accounts',
    name: 'ApplicationAccountList',
    component: () => import('@/views/accounts/ApplicationAccount/ApplicationAccountList'),
    meta: { title: i18n.t('route.AssetAccount') }
  },
  {
    path: 'gathered-user',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.GatherUser.GatherUserList') },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser'),
        name: 'GatherUserListIndex',
        meta: { title: i18n.t('xpack.GatherUser.GatherUser') }
      },
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/GatheredUserList'),
        name: 'GatherUserList',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserList'), hidden: true }
      },
      {
        path: 'tasks',
        component: () => import('@/views/accounts/GatheredUser/TaskList'),
        name: 'GatherUserTaskList',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskList'), hidden: true }
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/GatheredUser/TaskDetail'),
        name: 'GatherUserTaskDetail',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'), hidden: true }
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskCreate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'), hidden: true }
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskUpdate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'), action: 'update', hidden: true }
      }
    ]
  },
  {
    path: 'change-auth-plan',
    component: empty,
    meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan') },
    children: [
      {
        path: 'plan',
        component: () => import('@/views/accounts/ChangeAuthPlan/ChangeAuthPlanList.vue'),
        name: 'ChangeAuthPlanList',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan') }
      },
      {
        path: 'plan/create',
        component: () => import('@/views/accounts/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'ChangeAuthPlanCreate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanCreate'), action: 'create', hidden: true }
      },
      {
        path: 'plan/:id/update',
        component: () => import('@/views/accounts/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
        name: 'ChangeAuthPlanUpdate',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanUpdate'), action: 'update', hidden: true }
      },
      {
        path: 'plan/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/ChangeAuthPlanDetail'),
        name: 'ChangeAuthPlanDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), hidden: true }
      },
      {
        path: 'plan-execution/:id',
        component: () => import('@/views/accounts/ChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail'),
        name: 'ChangeAuthPlanExecutionDetail',
        meta: { title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'), hidden: true }
      }
    ]
  }
]
