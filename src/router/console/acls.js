import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'asset-acl',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.AssetAclList'),
      licenseRequired: true,
      resource: 'loginassetacl'
    },
    children: [
      {
        path: '',
        name: 'AssetAclList',
        component: () => import('@/views/acl/AssetAcl/AssetAclList'),
        meta: { title: i18n.t('route.AssetAclList') }
      },
      {
        path: 'create',
        name: 'AssetAclCreate',
        component: () => import('@/views/acl/AssetAcl/AssetAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclCreate') }
      },
      {
        path: ':id',
        name: 'AssetAclDetail',
        component: () => import('@/views/acl/AssetAcl/AssetAclDetail'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclDetail') }
      },
      {
        path: ':id/update',
        name: 'AssetAclUpdate',
        component: () => import('@/views/acl/AssetAcl/AssetAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclUpdate') }
      }
    ]
  }
]
