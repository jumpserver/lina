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
          name: 'UserLoginACLList'
        },
        meta: {
          title: i18n.t('UserLoginACLs'),
          app: 'acls',
          resource: 'loginacl',
          disableOrgsChange: true
        },
        children: [
          {
            path: '',
            name: 'UserLoginACLList',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLList.vue'),
            meta: {
              title: i18n.t('UserLoginACLs'), menuTitle: i18n.t('UserLogin'), activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'UserLoginACLCreate',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: {
              title: i18n.t('UserLoginACLCreate'), activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'UserLoginACLDetail',
            component: () => import('@/views/acls/UserLoginACL/UserDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('UserLoginACLDetail'), activeMenu: '',
              app: 'acls',
              resource: 'loginacl'
            }
          },
          {
            path: ':id/update',
            name: 'UserLoginACLUpdate',
            component: () => import('@/views/acls/UserLoginACL/UserLoginACLCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('UserLoginACLUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'cmd-acls',
        component: empty,
        redirect: {
          name: 'CommandFilterACLList'
        },
        name: 'CmdACL',
        meta: {
          title: i18n.t('CommandFilterACLs',),
          menuTitle: i18n.t('CommandFilter'),
          app: 'acls',
          resource: 'commandfilteracl'
        },
        children: [
          // Command Filter ACL
          {
            path: '',
            name: 'CommandFilterACLList',
            component: () => import('@/views/acls/CommandFilterACL/index'),
            hidden: true,
            meta: {
              title: i18n.tc('CommandFilterACL', 2),
              menuTitle: i18n.t('CommandFilter'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandFilterACLCreate',
            component: () => import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterACLCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'CommandFilterACLDetail',
            component: () => import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandFilterACLDetail'),
              activeMenu: ''
            }
          },
          {
            path: ':id/update',
            name: 'CommandFilterACLUpdate',
            component: () => import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('CommandFilterACLUpdate'), activeMenu: '' }
          }
        ]
      },
      {
        path: 'login-asset-acls',
        component: empty,
        redirect: {
          name: 'AssetACLList'
        },
        name: 'LoginAssetACLs',
        meta: {
          title: i18n.t('BaseAssetACLs'),
          licenseRequired: true,
          app: 'acls',
          resource: 'loginassetacl'
        },
        children: [
          {
            path: '',
            name: 'AssetACLList',
            component: () => import('@/views/acls/AssetLoginACL/AssetLoginAclList.vue'),
            meta: { title: i18n.t('AssetACLs'), activeMenu: '', menuTitle: i18n.t('AssetConnect') }
          },
          {
            path: 'create',
            name: 'AssetACLCreate',
            component: () => import('@/views/acls/AssetLoginACL/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetACLCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'AssetACLDetail',
            component: () => import('@/views/acls/AssetLoginACL/AssetLoginAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('AssetACLDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'AssetACLUpdate',
            component: () => import('@/views/acls/AssetLoginACL/AssetLoginAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('AssetACLUpdate'), activeMenu: '' }
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
            component: () => import('@/views/acls/CommandFilterACL/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupList'),
              activeMenu: ''
            }
          },
          {
            path: 'create',
            name: 'CommandGroupCreate',
            component: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupCreateUpdate'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupCreate'),
              activeMenu: ''
            }
          },
          {
            path: ':id',
            name: 'CommandGroupDetail',
            component: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupDetail/index'),
            hidden: true,
            meta: {
              title: i18n.t('CommandGroupDetail'),
              activeMenu: '/console/perms/acls/cmd-acls'
            }
          },
          {
            path: ':id/update',
            name: 'CommandGroupUpdate',
            component: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupCreateUpdate'),
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
          name: 'ConnectMethodACLList'
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
            name: 'ConnectMethodACLList',
            component: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclList.vue'),
            meta: { title: i18n.t('ConnectMethodACLs'), activeMenu: '', menuTitle: i18n.t('ConnectMethod') }
          },
          {
            path: 'create',
            name: 'ConnectMethodACLCreate',
            component: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclCreate'), activeMenu: '' }
          },
          {
            path: ':id',
            name: 'ConnectMethodAclDetail',
            component: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclDetail/index'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclDetail'), activeMenu: '' }
          },
          {
            path: ':id/update',
            name: 'ConnectMethodAclUpdate',
            component: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclCreateUpdate.vue'),
            hidden: true,
            meta: { title: i18n.t('ConnectMethodAclUpdate'), activeMenu: '' }
          }
        ]
      }
    ]
  }
]
