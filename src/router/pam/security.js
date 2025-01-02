import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'check',
    name: 'AccountCheck',
    component: empty,
    redirect: {
      name: 'AccountCheckList'
    },
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
          title: i18n.t('RiskDetection'),
          permissions: ['accounts.view_accountrisk']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/pam/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckCreate'),
          permissions: ['accounts.view_accountrisk']
        }
      },
      {
        path: 'update/:id',
        component: () => import('@/views/pam/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckUpdate'),
          permissions: ['accounts.view_accountrisk']
        }
      }
    ]
  }
]
