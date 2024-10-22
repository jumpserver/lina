import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'check',
    name: 'AccountCheck',
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
        component: () => import('@/views/pam/AccountScan/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('账号检查'),
          menuTitle: i18n.t('账号检查'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      }
    ]
  },
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
          title: i18n.t('风险分析'),
          menuTitle: i18n.t('风险分析'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      }
    ]
  }
]
