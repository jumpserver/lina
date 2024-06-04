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
        path: 'cmd-acls',
        component: empty,
        redirect: 'cmd-acls/list',
        name: 'CmdACL',
        meta: {
          title: i18n.t('CommandFilterAclList'),
          app: 'acls',
          resource: 'commandfilteracl'
        },
        children: [
          // Command Filter ACL
          {
            path: 'list',
            name: 'CommandFilterAclList',
            component: () => import('@/views/acl/CommandAcl/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandFilterAclList'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandFilterAclCreate',
            component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'CommandFilterAclDetail',
            component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'CommandFilterAclUpdate',
            component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'login-asset-acls',
        component: empty,
        redirect: 'login-asset-acls/list',
        // name: 'LoginAssetAcls',
        meta: {
          // title: i18n.t('AssetAclList'),
          licenseRequired: true,
          app: 'acls',
          resource: 'loginassetacl'
        },
        children: [
          {
            path: '',
            name: 'AssetAclList',
            component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclList.vue'),
            meta: { title: i18n.t('AssetAclList'), activeMenu: '' }
          },
          {
            path: 'create',
            name: 'AssetAclCreate',
            component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'AssetAclDetail',
            component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('AssetAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'AssetAclUpdate',
            component: () => import('@/views/acl/AssetLoginAcl/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'cmd-groups',
        component: empty,
        redirect: '',
        // name: 'CmdGroups',
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
            component: () => import('@/views/acl/CommandAcl/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupList'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandGroupCreate',
            component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupCreate'),
              activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'CommandGroupDetail',
            component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupDetail'),
              activeMenu: ''
            }
          },
          {
            path: ':id/update',
            name: 'CommandGroupUpdate',
            component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupCreateUpdate'),
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
        redirect: '',
        // name: 'ConnectMethodACL',
        meta: {
          // title: i18n.t('ConnectMethodList'),
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
            meta: { title: i18n.t('ConnectMethodAclList'), activeMenu: '' }
          },
          {
            path: 'create',
            name: 'ConnectMethodAclCreate',
            component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'ConnectMethodAclDetail',
            component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'ConnectMethodAclUpdate',
            component: () => import('@/views/acl/ConnectMethodAcl/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'login-acls',
        component: globalSubmenu,
        redirect: '',
        hidden: true,
        meta: {
          // title: i18n.t('UserLoginAclList'),
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
              title: i18n.t('UserLoginAclList'), activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'UserLoginAclCreate',
            component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: {
              title: i18n.t('UserLoginAclCreate'), activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'UserLoginAclDetail',
            component: () => import('@/views/acl/UserLoginACL/UserDetail/index'),
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
            component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('UserLoginAclUpdate'), activeMenu: '' }
          }
        ]
      }
    ]
  }
]
