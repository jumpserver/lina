import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
import { createViewSetRoutes } from '../viewset'

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
          disableOrgsChange: true,
          licenseRequired: true
        },
        children: createViewSetRoutes({
          name: 'UserLoginACL',
          list: () => import('@/views/acls/UserLoginACL/UserLoginACLList.vue'),
          form: () => import('@/views/acls/UserLoginACL/UserLoginACLCreateUpdate.vue'),
          detail: () => import('@/views/acls/UserLoginACL/UserDetail/index'),
          meta: {
            shared: { activeMenu: '' },
            list: { title: i18n.t('UserLoginACLs'), menuTitle: i18n.t('UserLogin') },
            detail: { app: 'acls', resource: 'loginacl' }
          }
        })
      },
      {
        path: 'cmd-acls',
        component: empty,
        redirect: {
          name: 'CommandFilterACLList'
        },
        name: 'CmdACL',
        meta: {
          title: i18n.t('CommandFilterACLs'),
          menuTitle: i18n.t('CommandFilter'),
          app: 'acls',
          resource: 'commandfilteracl'
        },
        children: createViewSetRoutes({
          name: 'CommandFilterACL',
          list: () => import('@/views/acls/CommandFilterACL/index'),
          form: () =>
            import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclCreateUpdate'),
          detail: () =>
            import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclDetail/index'),
          hidden: { list: true },
          meta: {
            shared: { activeMenu: '' },
            list: {
              title: i18n.tc('CommandFilterACL', 2),
              menuTitle: i18n.t('CommandFilter')
            }
          }
        })
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
        children: createViewSetRoutes({
          name: 'AssetACL',
          list: () => import('@/views/acls/AssetLoginACL/AssetLoginAclList.vue'),
          form: () => import('@/views/acls/AssetLoginACL/AssetLoginAclCreateUpdate.vue'),
          detail: () => import('@/views/acls/AssetLoginACL/AssetLoginAclDetail/index'),
          meta: {
            shared: { activeMenu: '' },
            list: { title: i18n.t('AssetACLs'), menuTitle: i18n.t('AssetConnect') }
          }
        })
      },
      {
        path: 'data-masking-rules',
        component: empty,
        redirect: {
          name: 'DataMaskingRuleList'
        },
        name: 'DataMaskingRules',
        meta: {
          title: i18n.t('DataMasking'),
          licenseRequired: true,
          app: 'acls',
          resource: 'datamaskingrule'
        },
        children: createViewSetRoutes({
          name: 'DataMaskingRule',
          list: () => import('@/views/acls/DataMaskingRule/DataMaskingRuleList.vue'),
          form: () => import('@/views/acls/DataMaskingRule/DataMaskingRuleCreateUpdate.vue'),
          detail: () => import('@/views/acls/DataMaskingRule/DataMaskingRuleDetail/index'),
          meta: {
            shared: { activeMenu: '' },
            list: { title: i18n.t('DataMasking'), menuTitle: i18n.t('DataMasking') },
            create: { title: '' },
            update: { title: '' },
            detail: { title: i18n.t('AssetACLDetail') }
          }
        })
      },
      {
        path: 'clipboard-acls',
        component: empty,
        redirect: {
          name: 'ClipboardACLList'
        },
        name: 'ClipboardACLs',
        meta: {
          title: i18n.t('ClipboardACLs'),
          licenseRequired: true,
          app: 'acls',
          resource: 'clipboardacl'
        },
        children: createViewSetRoutes({
          name: 'ClipboardACL',
          list: () => import('@/views/acls/ClipboardACL/ClipboardAclList.vue'),
          form: () => import('@/views/acls/ClipboardACL/ClipboardAclCreateUpdate.vue'),
          detail: () => import('@/views/acls/ClipboardACL/ClipboardAclDetail/index'),
          meta: {
            shared: { activeMenu: '' },
            list: { title: i18n.t('ClipboardACLs'), menuTitle: i18n.t('Clipboard') }
          }
        })
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
        children: createViewSetRoutes({
          name: 'CommandGroup',
          list: () => import('@/views/acls/CommandFilterACL/index'),
          form: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupCreateUpdate'),
          detail: () =>
            import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupDetail/index'),
          hidden: { list: true },
          meta: {
            shared: { activeMenu: '' },
            detail: { activeMenu: '/console/perms/acls/cmd-acls' }
          }
        })
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
        children: createViewSetRoutes({
          name: 'ConnectMethodACL',
          list: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclList.vue'),
          form: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclCreateUpdate.vue'),
          detail: () => import('@/views/acls/ConnectMethodACL/ConnectMethodAclDetail/index'),
          meta: {
            shared: { activeMenu: '' },
            list: {
              title: i18n.t('ConnectMethodACLs'),
              menuTitle: i18n.t('ConnectMethod')
            },
            create: { title: i18n.t('ConnectMethodAclCreate') },
            update: { title: i18n.t('ConnectMethodAclUpdate') },
            detail: { title: i18n.t('ConnectMethodAclDetail') }
          }
        })
      }
    ]
  }
]
