import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
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
        meta: { title: i18n.t('route.AssetAclCreate'), activeMenu: '/acl/asset-acl' },
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
  },
  {
    path: 'user-login-acl',
    component: empty,
    redirect: '',
    children: [
      {
        path: 'create',
        name: 'UserLoginACLCreate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
        meta: { title: i18n.t('route.UserLoginACLCreate'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id',
        name: 'UserLoginACLDetail',
        component: () => import('@/views/acl/UserLoginACL/UserDetail'),
        meta: { title: i18n.t('route.UserLoginACL'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'UserLoginACLUpdate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
        meta: { title: i18n.t('route.UserLoginACLUpdate'), activeMenu: '/users/users' },
        hidden: true
      }
    ]
  }
]
