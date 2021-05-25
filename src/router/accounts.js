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
      }
    ]
  },
  {
    path: 'asset-accounts2',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'AssetAccountList2',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: { title: i18n.t('route.AssetAccount') }
      }
    ]
  }
]
