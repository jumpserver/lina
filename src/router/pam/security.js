import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'check',
    name: 'AccountCheck',
    component: empty,
    meta: {
      app: 'accounts',
      name: 'BaseAccountRisk',
      icon: 'scan',
      resource: 'accountcheckautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/pam/AccountCheck/index.vue'),
        name: 'AccountCheckList',
        meta: {
          title: i18n.t('账号检查'),
          menuTitle: i18n.t('账号检查')
        }
      },
      {
        path: 'create',
        component: () => import('@/views/pam/AccountCheck/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckCreateUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckCreate')
        }
      }
    ]
  }
]
