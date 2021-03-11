import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'user-acl',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.UserAclList') },
    hidden: true,
    children: [
      {
        path: '',
        name: 'UserAclList',
        component: () => import('@/views/acl/UserAcl/UserAclList'),
        meta: { title: i18n.t('route.UserAclList'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: 'create',
        name: 'UserAclCreate',
        component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
        meta: { title: i18n.t('route.UserAclCreate'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id',
        name: 'UserAclDetail',
        component: () => import('@/views/acl/UserAcl/UserAclDetail'),
        meta: { title: i18n.t('route.UserAclDetail'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'UserAclUpdate',
        component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
        meta: { title: i18n.t('route.UserAclUpdate') },
        hidden: true
      }
    ]
  },
  {
    path: 'asset-acl',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.AssetAclList'),
      licenseRequired: true
    },
    children: [
      {
        path: '',
        name: 'AssetAclList',
        component: () => import('@/views/acl/AssetAcl/AssetAclList'),
        meta: { title: i18n.t('route.AssetAclList'), activeMenu: '/acl/asset-acl' }
      },
      {
        path: 'create',
        name: 'AssetAclCreate',
        component: () => import('@/views/acl/AssetAcl/AssetAclCreateUpdate'),
        meta: { title: i18n.t('route.AssetAclCreate'), activeMenu: '/acl/assetAcl' },
        hidden: true
      },
      {
        path: ':id',
        name: 'AssetAclDetail',
        component: () => import('@/views/acl/AssetAcl/AssetAclDetail'),
        meta: { title: i18n.t('route.AssetAclDetail'), activeMenu: '/acl/asset-acl' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'AssetAclUpdate',
        component: () => import('@/views/acl/AssetAcl/AssetAclCreateUpdate'),
        meta: { title: i18n.t('route.AssetAclUpdate'), activeMenu: '/acl/asset-acl' },
        hidden: true
      }
    ]
  }
]
