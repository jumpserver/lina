import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'service',
    name: 'AccountService',
    component: empty,
    redirect: {
      name: 'AccountServiceList'
    },
    meta: {
      app: 'accounts',
      name: 'AccountService',
      icon: 'service',
      resource: 'pushaccountautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountPush/index.vue'),
        name: 'AccountServiceList',
        meta: {
          title: i18n.t('服务对接'),
          menuTitle: i18n.t('服务对接'),
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
        name: 'AccountCheckDetail',
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
        name: 'AccountCheckExecutionDetail',
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
