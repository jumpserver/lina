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
        component: () => import('@/views/pam/AccountCheck/index.vue'),
        name: 'AccountPushList',
        meta: {
          title: i18n.t('账号检查'),
          menuTitle: i18n.t('账号检查'),
          permissions: ['accounts.view_pushaccountautomation']
        }
      }
    ]
  }
]
