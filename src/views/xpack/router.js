import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'

export default {
  path: '/xpack',
  component: Layout,
  redirect: '/applications/remote-apps/',
  name: 'Xpack',
  meta: { title: 'Xpack', icon: 'th' },
  children: [
    {
      path: 'interface-setting',
      component: () => import('@/views/xpack/InterfaceSettings.vue'),
      name: 'InterfaceSetting',
      meta: { title: i18n.t('xpack.InterfaceSettings') }
    },
    {
      path: 'license',
      component: () => import('@/views/xpack/License.vue'),
      name: 'License',
      meta: { title: i18n.t('xpack.License') }
    },
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
      component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanList.vue'),
      name: 'ChangeAuthPlan',
      meta: { title: i18n.t('xpack.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan' }
    },
    {
      path: 'change-auth-plan/create',
      component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
      name: 'ChangeAuthPlanCreate',
      meta: { title: i18n.t('xpack.ChangeAuthPlanCreate'), activeMenu: '/xpack/change-auth-plan', action: 'create' },
      hidden: true
    },
    {
      path: 'change-auth-plan/:id/update',
      component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
      name: 'ChangeAuthPlanUpdate',
      meta: { title: i18n.t('xpack.ChangeAuthPlanUpdate'), activeMenu: '/xpack/change-auth-plan', action: 'update' },
      hidden: true
    },
    {
      path: 'change-auth-plan/:id',
      component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
      name: 'ChangeAuthPlanDetail',
      meta: { title: i18n.t('xpack.ChangeAuthPlanDetail'), activeMenu: '/xpack/change-auth-plan' },
      hidden: true
    },
    {
      path: 'change-auth-plan/:id/execution/task',
      component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/ChangeAuthPlanExecutionTaskList.vue'),
      name: 'ChangeAuthPlanExecutionTask',
      meta: { title: i18n.t('xpack.ChangeAuthPlanExecutionTask'), activeMenu: '/xpack/change-auth-plan' },
      hidden: true
    }
  ]
}
