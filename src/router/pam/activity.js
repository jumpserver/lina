import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'session',
    name: 'AccountSession',
    component: empty,
    meta: {
      app: 'accounts',
      name: 'BaseAccountSession',
      icon: 'accounts',
      resource: 'pushaccountautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/pam/AccountCheck/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('账号会话'),
          menuTitle: i18n.t('账号会话'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      }
    ]
  },
  {
    path: 'activity',
    name: 'AccountActivity',
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
          title: i18n.t('活动记录'),
          menuTitle: i18n.t('活动记录'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      }
    ]
  }
]
