import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'account-change-secret',
    name: 'AccountChangeSecret',
    component: empty,
    redirect: {
      name: 'AccountChangeSecretList'
    },
    meta: {
      icon: 'change-password',
      app: 'accounts'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
        name: 'AccountChangeSecretList',
        meta: {
          menuTitle: i18n.t('MenuChangeSecret'),
          title: i18n.t('AccountChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretCreate',
        hidden: true,
        meta: {
          title: i18n.t('AssetChangeSecretCreate'),
          permissions: ['accounts.add_changesecretautomation']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
        name: 'AccountChangeSecretUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AssetChangeSecretUpdate'),
          permissions: ['accounts.change_changesecretautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountChangeSecret/Detail/index.vue'),
        name: 'AccountChangeSecretDetail',
        hidden: true,
        meta: {
          title: i18n.t('ChangeSecret'),
          permissions: ['accounts.view_changesecretautomation']
        }
      },
      {
        path: 'executions',
        component: () => import('@/views/accounts/AccountChangeSecret/Executions/AccountChangeSecretExecutionList.vue'),
        name: 'AccountChangeSecretExecutionList',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionHistory'),
          permissions: ['accounts.view_changesecretexecution']
        }
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/AccountChangeSecret/ExecutionDetail/index.vue'),
        name: 'AccountChangeSecretExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          permissions: ['accounts.view_changesecretexecution']
        }
      }
    ]
  },
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
      resource: 'checkaccountautomation'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/RiskDetect/index.vue'),
        name: 'AccountCheckList',
        meta: {
          title: i18n.t('RiskDetection'),
          permissions: ['accounts.view_accountrisk | accounts.view_checkaccountautomation']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckCreate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckCreate'),
          permissions: ['accounts.add_checkaccountautomation']
        }
      },
      {
        path: 'update/:id',
        component: () => import('@/views/accounts/RiskDetect/AccountCheckCreateUpdate.vue'),
        name: 'AccountCheckUpdate',
        hidden: true,
        meta: {
          title: i18n.t('AccountCheckUpdate'),
          permissions: ['accounts.change_checkaccountautomation']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/RiskDetect/AccountCheckDetail/index.vue'),
        name: 'AccountCheckDetail',
        meta: {
          title: i18n.t('RiskDetectionDetail'),
          permissions: ['accounts.view_checkaccountautomation']
        },
        hidden: true
      },
      {
        path: 'executions/:id',
        component: () => import('@/views/accounts/RiskDetect/RiskHistoryExecutionDetail/index.vue'),
        name: 'RiskHistoryExecutionDetail',
        hidden: true,
        meta: {
          title: i18n.t('ExecutionDetail'),
          permissions: ['accounts.view_checkaccountexecution']
        }
      }
    ]
  }
]
