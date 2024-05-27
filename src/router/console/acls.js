import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const globalSubmenu = () => import('@/layout/globalOrg.vue')

export default [
  {
    path: 'acls',
    name: 'ACLList',
    component: () => import('@/views/acl/index.vue'),
    meta: {
      title: i18n.t('ACLs'),
      icon: 'acl',
      permissions: []
    }
  },
  {
    path: 'cmd-acls',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('CommandFilterAclList'),
      app: 'acls',
      resource: 'commandfilteracl',
      activeMenu: '/console/perms/acls'
    },
    children: [
      // Command Filter ACL
      {
        path: '',
        name: 'CommandFilterAclList',
        component: () => import('@/views/acl/CommandAcl/index'),
        hidden: true,
        meta: {
          title: i18n.t('CommandFilterAclList'),
          activeMenu: '/console/perms/acls'
        }
      },
      {
        path: 'create',
        name: 'CommandFilterAclCreate',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('CommandFilterAclCreate'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id',
        name: 'CommandFilterAclDetail',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('CommandFilterAclDetail'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id/update',
        name: 'CommandFilterAclUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
        hidden: true,
        meta: { title: i18n.t('CommandFilterAclUpdate'), activeMenu: '/console/perms/acls' }
      }
    ]
  },
  {
    path: 'login-asset-acls',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('AssetAclList'),
      licenseRequired: true,
      app: 'acls',
      resource: 'loginassetacl'
    },
    children: [
      {
        path: '',
        name: 'AssetAclList',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclList.vue'),
        meta: { title: i18n.t('AssetAclList'), activeMenu: '/console/perms/acls' }
      },
      {
        path: 'create',
        name: 'AssetAclCreate',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('AssetAclCreate'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id',
        name: 'AssetAclDetail',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('AssetAclDetail'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id/update',
        name: 'AssetAclUpdate',
        component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('AssetAclUpdate'), activeMenu: '/console/perms/acls' }
      }
    ]
  },
  {
    path: 'cmd-groups',
    component: empty,
    redirect: '',
    hidden: true,
    meta: {
      app: 'acls',
      resource: 'commandgroup',
      activeMenu: '/console/perms/acls'
    },
    children: [
      // Command Group
      {
        path: '',
        name: 'CommandGroupList',
        component: () => import('@/views/acl/CommandAcl/index'),
        hidden: true,
        meta: {
          title: i18n.t('CommandGroupList'),
          activeMenu: '/console/perms/acls'
        }
      },
      {
        path: 'create',
        name: 'CommandGroupCreate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: {
          title: i18n.t('CommandGroupCreate'),
          activeMenu: '/console/perms/acls'
        }
      },
      {
        path: ':id',
        name: 'CommandGroupDetail',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('CommandGroupDetail'),
          activeMenu: '/console/perms/acls'
        }
      },
      {
        path: ':id/update',
        name: 'CommandGroupUpdate',
        component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
        hidden: true,
        meta: {
          title: i18n.t('CommandGroupUpdate'),
          activeMenu: '/console/perms/acls'
        }
      }
    ]
  },
  {
    path: 'connect-method-acls',
    component: globalSubmenu,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('ConnectMethodList'),
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
        meta: { title: i18n.t('ConnectMethodAclList'), activeMenu: '/console/perms/acls' }
      },
      {
        path: 'create',
        name: 'ConnectMethodAclCreate',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('ConnectMethodAclCreate'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id',
        name: 'ConnectMethodAclDetail',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclDetail/index'),
        hidden: true,
        meta: { title: i18n.t('ConnectMethodAclDetail'), activeMenu: '/console/perms/acls' }
      },
      {
        path: ':id/update',
        name: 'ConnectMethodAclUpdate',
        component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('ConnectMethodAclUpdate'), activeMenu: '/console/perms/acls' }
      }
    ]
  },
  {
    path: 'login-acls',
    component: globalSubmenu,
    redirect: '',
    hidden: true,
    meta: {
      title: i18n.t('UserLoginAclList'),
      app: 'acls',
      licenseRequired: true,
      resource: 'loginacl',
      disableOrgsChange: true
    },
    children: [
      {
        path: '',
        name: 'UserLoginAclList',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLList.vue'),
        meta: {
          title: i18n.t('UserLoginAclList'), activeMenu: '/console/perms/acls'
        }
      },
      {
        path: 'create',
        name: 'UserLoginAclCreate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
        hidden: true,
        meta: {
          title: i18n.t('UserLoginAclCreate'), activeMenu: '/console/perms/acls'
        }
      },
      {
        path: ':id',
        name: 'UserLoginAclDetail',
        component: () => import('@/views/acl/UserLoginACL/UserDetail/index'),
        hidden: true,
        meta: {
          title: i18n.t('UserLoginAclDetail'), activeMenu: '/console/perms/acls',
          app: 'acls',
          resource: 'loginacl'
        }
      },
      {
        path: ':id/update',
        name: 'UserLoginAclUpdate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
        hidden: true,
        meta: { title: i18n.t('UserLoginAclUpdate'), activeMenu: '/console/perms/acls' }
      }
    ]
  }
]
