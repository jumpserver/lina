import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const globalSubmenu = () => import('@/layout/globalOrg.vue')

export default [
  {
    path: 'login-acls',
    component: globalSubmenu,
    redirect: '',
    meta: {
      title: i18n.t('route.UserLoginAclList'),
      app: 'acls',
      resource: 'loginacl',
      disableOrgsChange: true
    },
    children: [
      {
        path: '',
        name: 'UserLoginAclList',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLList.vue'),
        meta: {
          title: i18n.t('route.UserLoginAclList')
        }
      },
      {
        path: 'create',
        name: 'UserLoginAclCreate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
        hidden: true,
        meta: {
          title: i18n.t('route.UserLoginAclCreate')
        }
      },
      {
        path: ':id',
        name: 'UserLoginAclDetail',
        component: () => import('@/views/acl/UserLoginACL/UserDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('route.UserLoginAclDetail'),
          app: 'acls',
          resource: 'loginacl'
        }
      },
      {
        path: ':id/update',
        name: 'UserLoginAclUpdate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.UserLoginAclUpdate') }
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
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclList.vue'),
        meta: { title: i18n.t('route.AssetAclList') }
      },
      {
        path: 'create',
        name: 'AssetAclCreate',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclCreate') }
      },
      {
        path: ':id',
        name: 'AssetAclDetail',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclDetail') }
      },
      {
        path: ':id/update',
        name: 'AssetAclUpdate',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.AssetAclUpdate') }
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
  },
  {
    path: 'connect-method-acls',
    component: globalSubmenu,
    redirect: '',
    meta: {
      title: i18n.t('route.ConnectMethodList'),
      licenseRequired: true,
      app: 'acls',
      disableOrgsChange: true,
      resource: 'connectmethodacl'
    },
    children: [
      {
        path: '',
        name: 'ConnectMethodAclList',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclList.vue'),
        meta: { title: i18n.t('route.ConnectMethodAclList') }
      },
      {
        path: 'create',
        name: 'ConnectMethodAclCreate',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.ConnectMethodAclCreate') }
      },
      {
        path: ':id',
        name: 'ConnectMethodAclDetail',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('route.ConnectMethodAclDetail') }
      },
      {
        path: ':id/update',
        name: 'ConnectMethodAclUpdate',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('route.ConnectMethodAclUpdate') }
      }
    ]
  }
]
