import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'risk',
    name: 'AccountRisk',
    component: empty,
    redirect: {
      name: 'AccountPushList'
    },
    meta: {
      app: 'accounts',
      name: 'BaseAccountRisk',
      icon: 'accounts',
      resource: 'pushaccountautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountPush/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('风险扫描'),
          menuTitle: i18n.t('风险扫描'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushCreate'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.add_pushaccountautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
        name: 'AccountPushUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushUpdate'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.change_pushaccountautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountPush/AccountPushDetail/index.vue'),
        name: 'AccountPushDetail',
        hidden: true,
        meta: {
          title: i18n.t('AccountPushList'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_pushaccountautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue'),
        name: 'AccountPushExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionList'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_pushaccountexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountPush/AccountPushExecutionDetail/index.vue'),
        name: 'AccountPushExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          // activeMenu: '/console/accounts/automations',
          permissions: ['accounts.view_pushaccountexecution']
        }
      }
    ]
  }
]
