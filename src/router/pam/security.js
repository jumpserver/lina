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
        component: () => import('@/views/pam/RiskDetect/index.vue'),
        name: 'AccountCheckList',
        meta: {
          title: i18n.t('RiskDetection')
        }
      },
      {
        path: 'create',
        component: () => import('@/views/pam/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckCreate')
        }
      },
      {
        path: 'update/:id',
        component: () => import('@/views/pam/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckUpdate')
        }
      }
    ]
  }
]
