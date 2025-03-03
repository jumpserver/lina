import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const globalSubmenu = () => import('@/layout/globalOrg.vue')

export default [
  {
    path: 'acls',
    name: 'ACLList',
    component: empty,
    redirect: 'cmd-acls',
    meta: {
      title: i18n.t('ACLs'),
      icon: 'acl',
      permissions: []
    },
    children: [
      {
        path: 'login-acls',
        component: globalSubmenu,
        redirect: {
          name: 'UserLoginAclList'
        },
        meta: {
          title: i18n.t('BaseUserLoginAclList'),
          app: 'acls',
          resource: 'loginacl',
          disableOrgsChange: true
        },
        children: [
          {
            path: '',
            name: 'UserLoginAclList',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLList.vue'),
            meta: {
              title: i18n.t('UserLoginAclList'), menuTitle: i18n.t('UserLogin'), activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'UserLoginAclCreate',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: {
              title: i18n.t('UserLoginAclCreate'), activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'UserLoginAclDetail',
            component: () => import('@/views/acls/UserLoginACL/UserDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('UserLoginAclDetail'), activeMenu: '',
              app: 'acls',
              resource: 'loginacl'
            }
          },
          {
            path: ':id/update',
            name: 'UserLoginAclUpdate',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('UserLoginAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'cmd-acls',
        component: empty,
        redirect: {
          name: 'CommandFilterAclList'
        },
        name: 'CmdACL',
        meta: {
          title: i18n.t('BaseCommandFilterAclList'),
          app: 'acls',
          resource: 'commandfilteracl'
        },
        children: [
          // Command Filter ACL
          {
            path: '',
            name: 'CommandFilterAclList',
            component: () => import('@/views/acls/CommandAcl/index'),
            hidden: true,
            meta: {
              title: i18n.t('BaseCommandFilterAclList'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandFilterAclCreate',
            component: () => import('@/views/acls/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'CommandFilterAclDetail',
            component: () => import('@/views/acls/CommandAcl/CommandFilterAcl/CommandFilterAclDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandFilterAclDetail'),
              activeMenu: ''
            }
          },
          {
            path: ':id/update',
            name: 'CommandFilterAclUpdate',
            component: () => import('@/views/acls/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'login-asset-acls',
        component: empty,
        redirect: {
          name: 'AssetAclList'
        },
        name: 'LoginAssetAcls',
        meta: {
          title: i18n.t('BaseAssetAclList'),
          licenseRequired: true,
          app: 'acls',
          resource: 'loginassetacl'
        },
        children: [
          {
            path: '',
            name: 'AssetAclList',
            component: () => import('@/views/acls/AssetLoginAcl/AssetLoginAclList.vue'),
            meta: { title: i18n.t('AssetAclList'), activeMenu: '', menuTitle: i18n.t('AssetConnect') }
          },
          {
            path: 'create',
            name: 'AssetAclCreate',
            component: () => import('@/views/acls/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'AssetAclDetail',
            component: () => import('@/views/acls/AssetLoginAcl/AssetLoginAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('AssetAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'AssetAclUpdate',
            component: () => import('@/views/acls/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'cmd-groups',
        component: empty,
        redirect: {
          name: 'CommandGroupList'
        },
        name: 'CmdGroups',
        hidden: true,
        meta: {
          app: 'acls',
          resource: 'commandgroup',
          activeMenu: ''
        },
        children: [
          // Command Group
          {
            path: '',
            name: 'CommandGroupList',
            component: () => import('@/views/acls/CommandAcl/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupList'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandGroupCreate',
            component: () => import('@/views/acls/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupCreate'),
              activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'CommandGroupDetail',
            component: () => import('@/views/acls/CommandAcl/CommandGroup/CommandGroupDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupDetail'),
              activeMenu: '/console/perms/acls/cmd-acls'
            }
          },
          {
            path: ':id/update',
            name: 'CommandGroupUpdate',
            component: () => import('@/views/acls/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupUpdate'),
              activeMenu: ''
            }
          }
        ]
      },
      {
        path: 'connect-method-acls',
        component: globalSubmenu,
        redirect: {
          name: 'ConnectMethodAclList'
        },
        name: 'ConnectMethodACL',
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
            component: () => import('@/views/acls/ConnectMethodAcl/ConnectMethodAclList.vue'),
            meta: { title: i18n.t('ConnectMethodAclList'), activeMenu: '', menuTitle: i18n.t('ConnectMethod') }
          },
          {
            path: 'create',
            name: 'ConnectMethodAclCreate',
            component: () => import('@/views/acls/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'ConnectMethodAclDetail',
            component: () => import('@/views/acls/ConnectMethodAcl/ConnectMethodAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'ConnectMethodAclUpdate',
            component: () => import('@/views/acls/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclUpdate'), activeMenu: '' }
          }
        ]
      }
    ]
  }
]
