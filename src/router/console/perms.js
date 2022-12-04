import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'asset-permissions',
    component: empty,
    meta: {
      title: i18n.t('route.AssetPermission'),
      resource: 'assetpermission'
    },
    children: [
      {
        path: '',
        name: 'AssetPermissionList',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionList'),
        meta: { title: i18n.t('route.AssetPermission') }
      },
      {
        path: 'create',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate'),
        name: 'AssetPermissionCreate',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionCreate'), action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionCreateUpdate.vue'),
        name: 'AssetPermissionUpdate',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionUpdate'), action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/perms/AssetPermission/AssetPermissionDetail'),
        name: 'AssetPermissionDetail',
        hidden: true,
        meta: { title: i18n.t('route.AssetPermissionDetail') }
      }
    ]
  },
  {
    path: 'host-acls',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.AssetAclList'),
      licenseRequired: true,
      app: 'acls',
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
  },
  {
    path: 'cmd-acls',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.CommandFilterAclList'),
      app: 'acls',
      resource: 'commandfilteracl'
    },
    children: [
      // Command Filter ACL
      {
        path: '',
        name: 'CommandFilterAclList',
        component: () => import('@/views/acl/CommandAcl/index'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclList') }
      },
      {
        path: 'create',
        name: 'CommandFilterAclCreate',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclCreate') }
      },
      {
        path: ':id',
        name: 'CommandFilterAclDetail',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclDetail'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclDetail') }
      },
      {
        path: ':id/update',
        name: 'CommandFilterAclUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclUpdate') }
      },
      // Command Group
      {
        path: '',
        name: 'CommandGroupList',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupList'),
        meta: { title: i18n.t('route.CommandGroupList') },
        hidden: true,
        app: 'acls',
        resource: 'commandgroup'
      },
      {
        path: 'create',
        name: 'CommandGroupCreate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.CommandGroupCreate') },
        app: 'acls',
        resource: 'commandgroup'
      },
      {
        path: ':id',
        name: 'CommandGroupDetail',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupDetail'),
        hidden: true,
        meta: { title: i18n.t('route.CommandGroupDetail') },
        app: 'acls',
        resource: 'commandgroup'
      },
      {
        path: ':id/update',
        name: 'CommandGroupUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.CommandGroupUpdate') },
        app: 'acls',
        resource: 'commandgroup'
      }
    ]
  }
]
