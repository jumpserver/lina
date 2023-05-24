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
    path: 'login-asset-acls',
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
        component: () => import('@/views/acl/AssetAcl/AssetAclDetail/index'),
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
      resource: 'commandfilteracl',
      activeMenu: '/console/perms/cmd-acls'
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
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclDetail') }
      },
      {
        path: ':id/update',
        name: 'CommandFilterAclUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('route.CommandFilterAclUpdate') }
      }
    ]
  },
  {
    path: 'cmd-groups',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.CommandGroupList'),
      app: 'acls',
      resource: 'commandgroup',
      activeMenu: '/console/perms/cmd-acls'
    },
    hidden: true,
    children: [
      // Command Group
      {
        path: '',
        name: 'CommandGroupList',
        component: () => import('@/views/acl/CommandAcl/index'),
        hidden: true,
        meta: {
          title: i18n.t('route.CommandGroupList'),
          activeMenu: '/console/perms/cmd-acls'
        }
      },
      {
        path: 'create',
        name: 'CommandGroupCreate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: {
          title: i18n.t('route.CommandGroupCreate'),
          activeMenu: '/console/perms/cmd-acls'
        }
      },
      {
        path: ':id',
        name: 'CommandGroupDetail',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('route.CommandGroupDetail'),
          activeMenu: '/console/perms/cmd-acls'
        }
      },
      {
        path: ':id/update',
        name: 'CommandGroupUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: {
          title: i18n.t('route.CommandGroupUpdate'),
          activeMenu: '/console/perms/cmd-acls'
        }
      }
    ]
  }
]
