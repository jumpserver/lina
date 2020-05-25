import Layout from '@/layout/index'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

export default {
  path: '/xpack',
  component: Layout,
  redirect: '/applications/remote-apps/',
  name: 'Xpack',
  meta: { title: 'Xpack', icon: 'sitemap' },
  children: [
    {
      path: 'interface-setting',
      component: () => import('@/views/xpack/InterfaceSettings.vue'),
      name: 'InterfaceSetting',
      meta: { title: i18n.t('xpack.InterfaceSettings') }
    },
    // {
    //   path: 'license',
    //   component: () => import('@/views/xpack/License.vue'),
    //   name: 'License',
    //   meta: { title: i18n.t('xpack.License') }
    // },
    {
      path: 'gathered-users',
      component: () => import('@/views/xpack/GatheredUser/GatheredUserList'),
      name: 'GatherUserList',
      meta: { title: i18n.t('xpack.GatherUserList') }
    },
    {
      path: 'gathered-users/tasks',
      component: () => import('@/views/xpack/GatheredUser/TaskList'),
      name: 'GatherUserTaskList',
      meta: { title: i18n.t('xpack.GatherUserTaskList') },
      hidden: true
    },
    {
      path: 'gathered-users/tasks/create',
      component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
      name: 'GatherUserTaskCreate',
      meta: { title: i18n.t('xpack.GatherUserTaskCreate') },
      hidden: true
    },
    {
      path: 'gathered-users/tasks/update',
      component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
      name: 'GatherUserTaskUpdate',
      meta: { title: i18n.t('xpack.GatherUserTaskUpdate'), action: 'update' },
      hidden: true
    },
    {
      path: 'orgs',
      component: () => import('@/views/xpack/org/OrganizationList'),
      name: 'OrganizationList',
      meta: { title: i18n.t('xpack.OrganizationList') }
    },
    {
      path: 'orgs/create',
      component: () => import('@/views/xpack/org/OrganizationCreateUpdate'),
      name: 'OrganizationCreate',
      hidden: true,
      meta: { title: i18n.t('xpack.OrganizationCreate'), activeMenu: '/xpack/orgs', action: 'create' }
    },
    {
      path: 'orgs/:id/update',
      component: () => import('@/views/xpack/org/OrganizationCreateUpdate'),
      name: 'OrganizationUpdate',
      hidden: true,
      meta: { title: i18n.t('xpack.OrganizationUpdate'), activeMenu: '/xpack/orgs', action: 'update' }
    },
    {
      path: 'orgs/:id',
      component: () => import('@/views/xpack/org/OrganizationDetail/index'),
      name: 'OrganizationDetail',
      hidden: true,
      meta: { title: i18n.t('xpack.OrganizationDetail'), activeMenu: '/xpack/orgs' }
    },
    {
      path: 'change-auth-plan',
      component: empty,
      redirect: '/xpack/change-auth-plan/plan',
      name: 'ChangeAuthPlan',
      meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan' },
      children: [
        {
          path: 'plan',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanList.vue'),
          name: 'ChangeAuthPlanList',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan' }
        },
        {
          path: 'plan/create',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
          name: 'ChangeAuthPlanCreate',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanCreate'), activeMenu: '/xpack/change-auth-plan', action: 'create' },
          hidden: true
        },
        {
          path: 'plan/:id/update',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
          name: 'ChangeAuthPlanUpdate',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanUpdate'), activeMenu: '/xpack/change-auth-plan', action: 'update' },
          hidden: true
        },
        {
          path: 'plan/:id',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
          name: 'ChangeAuthPlanDetail',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan' },
          hidden: true
        },
        {
          path: 'plan/:id/execution/task',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/ChangeAuthPlanExecutionTaskList.vue'),
          name: 'ChangeAuthPlanExecutionTaskList',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanExecutionTask'), activeMenu: '/xpack/change-auth-plan' },
          hidden: true
        }
      ]
    },
    {
      path: '/cloud',
      component: empty,
      redirect: '/cloud/account',
      name: 'Cloud',
      meta: { title: i18n.t('xpack.Cloud.Cloud') },
      children: [
        {
          path: 'account',
          component: () => import('@/views/xpack/Cloud/Account/AccountList'),
          name: 'AccountList',
          meta: { title: i18n.t('xpack.Cloud.AccountList') }
        },
        {
          path: 'account/create',
          component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
          name: 'AccountCreate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountCreate'), action: 'create' }
        },
        {
          path: 'account/:id/update',
          component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
          name: 'AccountUpdate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountUpdate'), action: 'update' }
        },
        {
          path: 'sync-instance-tasks',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
          name: 'SyncInstanceTaskList',
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskList') }
        },
        {
          path: 'sync-instance-tasks/create',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
          name: 'SyncInstanceTaskCreate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate') }
        },
        {
          path: 'sync-instance-tasks/:id/update',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
          name: 'SyncInstanceTaskUpdate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate') }
        }
      ]
    }

  ]
}
