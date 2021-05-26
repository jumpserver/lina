import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'asset-accounts',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: { title: i18n.t('route.AssetAccount') }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountCreate'),
        name: 'AssetAccountCreate',
        meta: { title: i18n.t('accounts.Create'), activeMenu: '/accounts/asset-accounts/' },
        hidden: true
      }
    ]
  },
  {
    path: 'application-accounts',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'ApplicationAccountList',
        component: () => import('@/views/accounts/ApplicationAccount/ApplicationAccountList'),
        meta: { title: i18n.t('route.ApplicationAccount') }
      }
    ]
  }
]
