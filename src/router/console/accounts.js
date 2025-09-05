import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'accounts',
    component: empty,
    name: 'Account',
    meta: {
      title: i18n.t('BaseAssetAccount'),
      app: 'accounts',
      icon: 'accounts',
      permissions: ['accounts.view_account']
    },
    redirect: {
      name: 'AssetAccountList'
    },
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/Account/index.vue'),
        meta: {
          title: i18n.t('AssetAccount'),
          showInSearch: true,
          app: 'accounts',
          permissions: ['accounts.view_account']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/Account/AccountDetail/index.vue'),
        name: 'AccountDetail',
        meta: { title: i18n.t('AccountDetail') },
        hidden: true
      }
    ]
  },
  {
    path: 'virtual-accounts',
    component: empty,
    meta: {
      title: i18n.t('VirtualAccount'),
      app: 'accounts',
      permissions: ['accounts.view_virtualaccount']
    },
    hidden: true,
    redirect: '/console/accounts/accounts',
    children: [
      {
        path: ':id/update',
        component: () => import('@/views/accounts/VirtualAccount/VirtualUpdate.vue'),
        name: 'VirtualAccountUpdate',
        meta: {
          title: i18n.t('VirtualAccountUpdate'),
          activeMenu: '/console/accounts/accounts',
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/VirtualAccount/VirtualDetail/index.vue'),
        name: 'VirtualAccountDetail',
        meta: {
          title: i18n.t('VirtualAccountDetail'),
          activeMenu: '/console/accounts/accounts'
        }
      }
    ]
  },
  {
    path: 'account-template',
    component: empty,
    redirect: {
      name: 'AccountTemplateList'
    },
    meta: {
      title: i18n.t('AccountTemplate'),
      app: 'accounts',
      icon: 'template',
      permissions: ['accounts.view_accounttemplate']
    },
    children: [
      {
        path: '',
        name: 'AccountTemplateList',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateList'),
        meta: {
          menuTitle: i18n.t('MenuAccountTemplates'),
          title: i18n.t('AccountTemplateList'),
          permissions: ['accounts.view_accounttemplate']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateCreate',
        meta: {
          title: i18n.t('CreateAccountTemplate'),
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateUpdate',
        meta: {
          title: i18n.t('UpdateAccountTemplate'),
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountTemplate/Detail/index.vue'),
        name: 'AccountTemplateDetail',
        meta: { title: i18n.t('AccountTemplate') },
        hidden: true
      }
    ]
  }
]
