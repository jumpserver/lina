import Layout from '@/layout/index'
import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

export default {
  path: '/xpack',
  component: Layout,
  redirect: '/applications/remote-apps/',
  name: 'Xpack',
  meta: { title: 'X-Pack', icon: 'sitemap', licenseRequired: true },
  children: [
    {
      path: 'change-auth-plan',
      component: empty,
      meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan/plan' },
      children: [
        {
          path: 'plan',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanList.vue'),
          name: 'ChangeAuthPlanList',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan/plan' }
        },
        {
          path: 'plan/create',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
          name: 'ChangeAuthPlanCreate',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanCreate'), activeMenu: '/xpack/change-auth-plan/plan', action: 'create' },
          hidden: true
        },
        {
          path: 'plan/:id/update',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanCreateUpdate.vue'),
          name: 'ChangeAuthPlanUpdate',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlanUpdate'), activeMenu: '/xpack/change-auth-plan/plan', action: 'update' },
          hidden: true
        },
        {
          path: 'plan/:id',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/index.vue'),
          name: 'ChangeAuthPlanDetail',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ChangeAuthPlan'), activeMenu: '/xpack/change-auth-plan/plan' },
          hidden: true
        },
        {
          path: 'plan-execution/:id',
          component: () => import('@/views/xpack/ChangeAuthPlan/ChangeAuthPlanDetail/ChangeAuthPlanExecution/ChangeAuthPlanExecutionDetail/index.vue'),
          name: 'ChangeAuthPlanExecutionDetail',
          meta: { title: i18n.t('xpack.ChangeAuthPlan.ExecutionDetail'), activeMenu: '/xpack/change-auth-plan/plan' },
          hidden: true
        }
      ]
    },
    {
      path: 'cloud',
      component: empty,
      redirect: '',
      meta: { title: i18n.t('xpack.Cloud.Cloud') },
      children: [
        {
          path: '',
          component: () => import('@/views/xpack/Cloud/index.vue'),
          name: 'CloudCenter',
          meta: { title: i18n.t('xpack.Cloud.CloudCenter') }
        },
        {
          path: 'account',
          component: () => import('@/views/xpack/Cloud/Account/AccountList'),
          name: 'AccountList',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountList') }
        },
        {
          path: 'account/create',
          component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
          name: 'AccountCreate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountCreate'), action: 'create', activeMenu: '/xpack/cloud' }
        },
        {
          path: 'account/:id/update',
          component: () => import('@/views/xpack/Cloud/Account/AccountCreateUpdate'),
          name: 'AccountUpdate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountUpdate'), action: 'update', activeMenu: '/xpack/cloud' }
        },
        {
          path: 'accounts/:id/',
          component: () => import('@/views/xpack/Cloud/Account/AccountDetail/index'),
          name: 'AccountDetail',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.AccountDetail'), activeMenu: '/xpack/cloud' }
        },
        {
          path: 'sync-instance-tasks',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskList'),
          name: 'SyncInstanceTaskList',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskList'), activeMenu: '/xpack/cloud' }
        },
        {
          path: 'sync-instance-tasks/create',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
          name: 'SyncInstanceTaskCreate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskCreate'), activeMenu: '/xpack/cloud' }
        },
        {
          path: 'sync-instance-tasks/:id/update',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskCreateUpdate'),
          name: 'SyncInstanceTaskUpdate',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskUpdate'), activeMenu: '/xpack/cloud' }
        },
        {
          path: 'sync-instance-tasks/:id',
          component: () => import('@/views/xpack/Cloud/SyncInstanceTask/SyncInstanceTaskDetail/index'),
          name: 'SyncInstanceTaskDetail',
          hidden: true,
          meta: { title: i18n.t('xpack.Cloud.SyncInstanceTaskDetail'), activeMenu: '/xpack/cloud' }
        }
      ]
    },
    {
      path: 'interface-setting',
      component: () => import('@/views/xpack/InterfaceSettings.vue'),
      name: 'InterfaceSetting',
      meta: { title: i18n.t('xpack.InterfaceSettings'), permissions: [rolec.PERM_SUPER] }
    },
    {
      path: 'gathered-users',
      component: empty,
      redirect: '',
      meta: { title: i18n.t('xpack.GatherUser.GatherUserList') },
      children: [
        {
          path: '',
          component: () => import('@/views/xpack/GatheredUser/index'),
          name: 'GatherUserListIndex',
          meta: { title: i18n.t('xpack.GatherUser.GatherUser'), activeMenu: '/xpack/gathered-users' }
        },
        {
          path: '',
          component: () => import('@/views/xpack/GatheredUser/GatheredUserList'),
          name: 'GatherUserList',
          hidden: true,
          meta: { title: i18n.t('xpack.GatherUser.GatherUserList'), activeMenu: '/xpack/gathered-users' }
        },
        {
          path: 'tasks',
          component: () => import('@/views/xpack/GatheredUser/TaskList'),
          name: 'GatherUserTaskList',
          meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskList'), activeMenu: '/xpack/gathered-users' },
          hidden: true
        },
        {
          path: 'tasks/create',
          component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
          name: 'GatherUserTaskCreate',
          meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'), activeMenu: '/xpack/gathered-users' },
          hidden: true
        },
        {
          path: 'tasks/:id/update',
          component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
          name: 'GatherUserTaskUpdate',
          meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'), action: 'update', activeMenu: '/xpack/gathered-users' },
          hidden: true
        }
      ]
    },
    {
      path: 'orgs',
      component: empty,
      redirect: '',
      meta: { permissions: [rolec.PERM_SUPER] },
      children: [
        {
          path: '',
          component: () => import('@/views/xpack/Org/OrganizationList'),
          name: 'OrganizationList',
          meta: { title: i18n.t('xpack.Organization.OrganizationList'), activeMenu: '/xpack/orgs' }
        },
        {
          path: 'create',
          component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
          name: 'OrganizationCreate',
          hidden: true,
          meta: { title: i18n.t('xpack.Organization.OrganizationCreate'), activeMenu: '/xpack/orgs', action: 'create' }
        },
        {
          path: ':id/update',
          component: () => import('@/views/xpack/Org/OrganizationCreateUpdate'),
          name: 'OrganizationUpdate',
          hidden: true,
          meta: { title: i18n.t('xpack.Organization.OrganizationUpdate'), activeMenu: '/xpack/orgs', action: 'update' }
        },
        {
          path: ':id',
          component: () => import('@/views/xpack/Org/OrganizationDetail/index'),
          name: 'OrganizationDetail',
          hidden: true,
          meta: { title: i18n.t('xpack.Organization.OrganizationDetail'), activeMenu: '/xpack/orgs' }
        }
      ]
    },
    {
      path: 'vault',
      component: empty,
      redirect: '',
      meta: { },
      children: [
        {
          path: '',
          component: () => import('@/views/xpack/Vault/VaultList.vue'),
          name: 'VaultList',
          meta: { title: i18n.t('xpack.Vault.Vault'), activeMenu: '/xpack/vault' }
        },
        {
          path: 'create',
          component: () => import('@/views/xpack/Vault/VaultCreate'),
          name: 'VaultCreate',
          meta: { title: i18n.t('xpack.Vault.Create'), activeMenu: '/xpack/vault' },
          hidden: true
        }
      ]
    }
  ]
}
