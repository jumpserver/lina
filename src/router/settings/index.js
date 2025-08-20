import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const Setting = () => import('@/views/settings/index')
const globalSubmenu = () => import('@/layout/globalOrg.vue')

export default {
  path: '/settings',
  component: Setting,
  redirect: '/settings/basic',
  name: 'SystemSetting',
  meta: {
    title: i18n.t('Settings'),
    icon: 'system-setting',
    activeMenu: '/settings',
    view: 'settings',
    type: 'view',
    showNavSwitcher: false,
    showOrganization: false,
    permissions: ['settings.view_setting']
  },
  children: [
    {
      path: '/settings/basic',
      name: 'Basic',
      component: () => import('@/views/settings/Basic'),
      meta: {
        title: i18n.t('BasicSettings'),
        icon: 'basic',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/orgs',
      component: empty,
      redirect: '',
      meta: {
        app: 'orgs',
        resource: 'organization',
        permissions: ['orgs.view_organization'],
        licenseRequired: true
      },
      children: [
        {
          path: '',
          component: () => import('@/views/settings/Org/OrganizationList'),
          name: 'OrganizationList',
          meta: {
            title: i18n.t('OrganizationList'),
            icon: 'organization-set',
            permissions: ['orgs.view_organization']
          }
        },
        {
          path: 'create',
          component: () => import('@/views/settings/Org/OrganizationCreateUpdate'),
          name: 'OrganizationCreate',
          hidden: true,
          meta: {
            title: i18n.t('OrganizationCreate'),
            action: 'create',
            permissions: ['orgs.add_organization'],
            activeMenu: '/settings/orgs'
          }
        },
        {
          path: ':id/update',
          component: () => import('@/views/settings/Org/OrganizationCreateUpdate'),
          name: 'OrganizationUpdate',
          hidden: true,
          meta: {
            title: i18n.t('OrganizationUpdate'),
            action: 'update',
            permissions: ['orgs.change_organization'],
            activeMenu: '/settings/orgs'
          }
        },
        {
          path: ':id',
          component: () => import('@/views/settings/Org/OrganizationDetail/index'),
          name: 'OrganizationDetail',
          hidden: true,
          meta: {
            title: i18n.t('OrganizationDetail'),
            permissions: ['orgs.view_organization']
          }
        }
      ]
    },
    {
      path: '/settings/roles',
      component: globalSubmenu,
      redirect: '',
      meta: {
        permissions: ['rbac.view_orgrole | rbac.view_systemrole'],
        app: 'rbac',
        disableOrgsChange: true,
        licenseRequired: true,
        icon: 'role'
      },
      children: [
        {
          path: '',
          component: () => import('@/views/users/Role/RoleList/index'),
          name: 'RoleList',
          meta: {
            title: i18n.t('RoleList'),
            app: 'rbac',
            permissions: ['rbac.view_orgrole | rbac.view_systemrole']
          }
        },
        {
          path: 'create',
          component: () => import('@/views/users/Role/RoleCreateUpdate'),
          name: 'RoleCreate',
          hidden: true,
          meta: {
            title: i18n.t('RoleCreate'),
            permissions: [],
            app: 'rbac',
            resource: 'role'
          }
        },
        {
          path: ':id/update',
          component: () => import('@/views/users/Role/RoleCreateUpdate'),
          name: 'RoleUpdate',
          hidden: true,
          meta: {
            title: i18n.t('RoleUpdate'),
            app: 'rbac',
            permissions: []
          }
        },
        {
          path: ':id',
          component: () => import('@/views/users/Role/RoleDetail/index'),
          name: 'RoleDetail',
          hidden: true,
          meta: {
            title: i18n.t('RoleDetail'),
            app: 'rbac',
            resource: 'role',
            permissions: []
          }
        }
      ]
    },
    {
      path: '/settings/platforms',
      component: globalSubmenu,
      meta: {
        permissions: ['assets.view_platform'],
        resource: 'platform',
        icon: 'platform',
        app: 'assets',
        disableOrgsChange: true
      },
      redirect: '',
      children: [
        {
          path: '',
          name: 'PlatformList',
          component: () => import('@/views/assets/Platform/PlatformList'),
          meta: { title: i18n.t('PlatformList'), permissions: ['assets.view_platform'] }
        },
        {
          path: 'create',
          component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
          name: 'PlatformCreate',
          hidden: true,
          meta: { title: i18n.t('PlatformCreate') }
        },
        {
          path: ':id/update',
          component: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'), // Parent router-view
          name: 'PlatformUpdate',
          hidden: true,
          meta: { title: i18n.t('PlatformUpdate'), permissions: [] }
        },
        {
          path: ':id',
          component: () => import('@/views/assets/Platform/PlatformDetail'), // Parent router-view
          name: 'PlatformDetail',
          hidden: true,
          meta: { title: i18n.t('PlatformDetail') }
        }
      ]
    },
    {
      path: '/settings/notification',
      name: 'Msg',
      component: () => import('@/views/settings/Msg'),
      meta: {
        title: i18n.t('Notifications'),
        icon: 'remind',
        permissions: ['settings.change_email | settings.change_sms | settings.change_systemmsgsubscription']
      }
    },
    {
      path: '/settings/features',
      name: 'Feature',
      component: () => import('@/views/settings/Feature'),
      meta: {
        title: i18n.t('Features'),
        icon: 'feature',
        permissions: [
          'settings.change_ticket | settings.change_ops | settings.change_vault | ' +
          'settings.change_chatai | settings.change_virtualapp'
        ]
      }
    },
    {
      path: '/settings/auth',
      name: 'Auth',
      component: () => import('@/views/settings/Auth'),
      meta: {
        title: i18n.t('Auth'),
        icon: 'attestation',
        permissions: ['settings.change_auth']
      }
    },
    {
      path: '/settings/storage',
      component: empty,
      redirect: {
        name: 'Storage'
      },
      meta: {
        title: i18n.t('BaseStorage'),
        app: 'terminal',
        permissions: ['terminal.view_commandstorage | terminal.view_replaystorage']
      },
      children: [
        {
          path: '',
          name: 'Storage',
          component: () => import('@/views/settings/Storage'),
          meta: {
            title: i18n.t('StorageSetting'),
            icon: 'storage',
            permissions: ['settings.change_terminal']
          }
        },
        {
          path: 'replay-storage/create',
          name: 'CreateReplayStorage',
          component: () => import('@/views/settings/Storage/ObjectStorageCreateUpdate.vue'),
          meta: {
            title: i18n.t('CreateReplayStorage'),
            activeMenu: '/settings/storage',
            permissions: ['terminal.add_replaystorage']
          },
          hidden: true
        },
        {
          path: 'replay-storage/:id/update',
          name: 'ReplayStorageUpdate',
          component: () => import('@/views/settings/Storage/ObjectStorageCreateUpdate.vue'),
          meta: {
            title: i18n.t('ReplayStorageUpdate'),
            activeMenu: '/settings/storage',
            permissions: ['terminal.change_replaystorage']
          },
          hidden: true
        },
        {
          path: 'command-storage/create',
          name: 'CreateCommandStorage',
          component: () => import('@/views/settings/Storage/CommandStorageCreateUpdate'),
          meta: {
            title: i18n.t('CreateCommandStorage'),
            activeMenu: '/settings/storage',
            permissions: ['terminal.add_commandstorage']
          },
          hidden: true
        },
        {
          path: 'command-storage/:id/update',
          name: 'CommandStorageUpdate',
          component: () => import('@/views/settings/Storage/CommandStorageCreateUpdate'),
          meta: {
            title: i18n.t('CommandStorageUpdate'),
            activeMenu: '/settings/storage',
            permissions: ['terminal.change_commandstorage']
          },
          hidden: true
        }
      ]
    },
    {
      path: '/settings/terminal',
      component: empty,
      redirect: {
        name: 'TerminalSetting'
      },
      meta: {
        title: i18n.t('BaseTerminal'),
        app: 'terminal',
        permissions: ['settings.change_terminal']
      },
      children: [
        {
          path: '',
          name: 'TerminalSetting',
          component: () => import('@/views/settings/Terminal'),
          meta: {
            title: i18n.t('Terminal'),
            icon: 'terminal-set',
            permissions: ['settings.change_terminal']
          }
        },
        {
          path: ':id',
          name: 'TerminalDetail',
          component: () => import('@/views/settings/Terminal/Component/TerminalDetail'),
          meta: {
            title: i18n.t('Terminal'),
            permissions: ['terminal.view_terminal']
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TerminalUpdate',
          component: () => import('@/views/settings/Terminal/Component/TerminalUpdate'),
          meta: {
            title: i18n.t('Terminal'),
            permissions: ['terminal.change_terminal']
          },
          hidden: true
        },
        {
          path: 'endpoint/create',
          name: 'EndpointCreate',
          component: () => import('@/views/settings/Terminal/Endpoint/EndpointCreateUpdate'),
          meta: {
            title: i18n.t('CreateEndpoint'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.add_endpoint']
          },
          hidden: true
        },
        {
          path: 'endpoint/:id/update',
          name: 'EndpointUpdate',
          component: () => import('@/views/settings/Terminal/Endpoint/EndpointCreateUpdate'),
          meta: {
            title: i18n.t('UpdateEndpoint'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.change_endpoint']
          },
          hidden: true
        },
        {
          path: 'endpoint-rule/create',
          name: 'EndpointRuleCreate',
          component: () => import('@/views/settings/Terminal/EndpointRule/EndpointRuleCreateUpdate'),
          meta: {
            title: i18n.t('CreateEndpointRule'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.add_endpointrule']
          },
          hidden: true
        },
        {
          path: 'endpoint-rule/:id/update',
          name: 'EndpointRuleUpdate',
          component: () => import('@/views/settings/Terminal/EndpointRule/EndpointRuleCreateUpdate'),
          meta: {
            title: i18n.t('UpdateEndpointRule'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.change_endpointrule']
          },
          hidden: true
        }
      ]
    },
    {
      path: '/settings/applets',
      component: empty,
      redirect: {
        name: 'Applets'
      },
      meta: {
        title: i18n.t('BaseApplets'),
        app: 'terminal',
        permissions: ['terminal.view_applet | terminal.view_applethost']
      },
      children: [
        {
          path: '',
          name: 'Applets',
          component: () => import('@/views/settings/Applet'),
          meta: {
            title: i18n.t('Applets'),
            icon: 'application',
            permissions: ['terminal.view_applet']
          }
        },
        {
          path: 'applets/:id',
          name: 'AppletDetail',
          component: () => import('@/views/settings/Applet/Applet/AppletDetail/index'),
          hidden: true,
          meta: {
            title: i18n.t('AppletDetail'),
            permissions: ['terminal.view_applet'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'hosts/create',
          name: 'AppletHostCreate',
          component: () => import('@/views/settings/Applet/AppletHost/AppletHostCreateUpdate'),
          hidden: true,
          meta: {
            title: i18n.t('AppletHostCreate'),
            permissions: ['terminal.add_applethost'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'hosts/:id',
          name: 'AppletHostDetail',
          component: () => import('@/views/settings/Applet/AppletHost/AppletHostDetail/index'),
          hidden: true,
          meta: {
            title: i18n.t('AppletHostDetail'),
            permissions: ['terminal.view_applethost'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'hosts/:id/update',
          name: 'AppletHostUpdate',
          component: () => import('@/views/settings/Applet/AppletHost/AppletHostCreateUpdate'),
          hidden: true,
          meta: {
            title: i18n.t('AppletHostUpdate'),
            permissions: ['terminal.change_applethost'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'virtual-apps/create',
          name: 'VirtualAppCreate',
          component: () => import('@/views/settings/Applet/VirtualApp/VirtualAppCreateUpdate'),
          hidden: true,
          meta: {
            title: i18n.t('VirtualAppCreate'),
            permissions: ['terminal.add_virtualapp'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'virtual-apps/:id',
          name: 'VirtualAppDetail',
          component: () => import('@/views/settings/Applet/VirtualApp/VirtualAppDetail/index.vue'),
          hidden: true,
          meta: {
            title: i18n.t('VirtualAppDetail'),
            permissions: ['terminal.view_virtualapp'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'virtual-apps/:id/update',
          name: 'VirtualAppUpdate',
          component: () => import('@/views/settings/Applet/VirtualApp/VirtualAppCreateUpdate'),
          hidden: true,
          meta: {
            title: i18n.t('VirtualHostUpdate'),
            permissions: ['terminal.change_virtualapp'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'app-providers/:id',
          name: 'AppProviderDetail',
          component: () => import('@/views/settings/Applet/AppProvider/AppProviderDetail/index.vue'),
          hidden: true,
          meta: {
            title: i18n.t('AppProviderDetail'),
            permissions: ['terminal.view_appprovider'],
            activeMenu: '/settings/applets'
          }
        }
      ]
    },
    {
      path: '/settings/security',
      name: 'Security',
      component: () => import('@/views/settings/Security'),
      meta: {
        title: i18n.t('Security'),
        icon: 'security',
        permissions: ['settings.change_security']
      }
    },
    {
      path: '/settings/interface',
      name: 'Interface',
      component: () => import('@/views/settings/Interface'),
      meta: {
        title: i18n.t('InterfaceSettings'),
        icon: 'face',
        licenseRequired: true,
        permissions: ['settings.change_interface']
      }
    },
    {
      path: '/settings/tools',
      name: 'Tools',
      component: () => import('@/views/settings/Tool'),
      meta: {
        title: i18n.t('SystemTools'),
        icon: 'tools',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/tasks',
      component: empty,
      redirect: {
        name: 'TaskList'
      },
      meta: {
        title: i18n.t('BaseSystemTasks'),
        icon: 'tasks',
        permissions: ['ops.view_celerytask']
      },
      children: [
        {
          path: '',
          name: 'TaskList',
          component: () => import('@/views/settings/Task/index.vue'),
          meta: {
            title: i18n.t('SystemTasks'),
            permissions: ['ops.view_celerytask']
          }
        },
        {
          path: ':id',
          component: () => import('@/views/settings/Task/TaskDetail'),
          name: 'TaskDetail',
          hidden: true,
          meta: {
            title: i18n.t('TaskDetail'),
            permissions: ['ops.view_celerytask'],
            activeMenu: '/settings/tasks'
          }
        }
      ]
    },
    {
      path: '/settings/license',
      name: 'License',
      component: () => import('@/views/settings/License'),
      meta: {
        title: i18n.t('License'),
        icon: 'license',
        permissions: ['settings.change_license']
      }
    }
  ]
}

