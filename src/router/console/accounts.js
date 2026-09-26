import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { createViewSetRoutes } from '../viewset'

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
    children: createViewSetRoutes({
      name: 'AccountTemplate',
      list: () => import('@/views/accounts/AccountTemplate/AccountTemplateList'),
      form: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
      detail: () => import('@/views/accounts/AccountTemplate/Detail/index.vue'),
      meta: {
        list: {
          menuTitle: i18n.t('MenuAccountTemplates'),
          permissions: ['accounts.view_accounttemplate']
        },
        create: { title: i18n.t('CreateAccountTemplate') },
        update: { title: i18n.t('UpdateAccountTemplate') },
        detail: { title: i18n.t('AccountTemplate') }
      }
    })
  }
]
