import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

const Setting = () => import('@/views/settings/index')

export default {
  path: '/settings',
  component: Setting,
  redirect: '/settings/basic',
  name: 'SystemSetting',
  meta: {
    title: i18n.t('route.Settings'),
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
        title: i18n.t('setting.Basic'),
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
            title: i18n.t('xpack.Organization.OrganizationList'),
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
            title: i18n.t('xpack.Organization.OrganizationCreate'),
            action: 'create',
            permissions: ['orgs.add_organization']
          }
        },
        {
          path: ':id/update',
          component: () => import('@/views/settings/Org/OrganizationCreateUpdate'),
          name: 'OrganizationUpdate',
          hidden: true,
          meta: {
            title: i18n.t('xpack.Organization.OrganizationUpdate'),
            action: 'update',
            permissions: ['orgs.change_organization']
          }
        },
        {
          path: ':id',
          component: () => import('@/views/settings/Org/OrganizationDetail/index'),
          name: 'OrganizationDetail',
          hidden: true,
          meta: {
            title: i18n.t('xpack.Organization.OrganizationDetail'),
            permissions: ['orgs.view_organization']
          }
        }
      ]
    },
    {
      path: '/settings/msg',
      name: 'Msg',
      component: () => import('@/views/settings/Msg'),
      meta: {
        title: i18n.t('setting.Message'),
        icon: 'email-set',
        permissions: ['settings.change_email']
      }
    },
    {
      path: '/settings/features',
      name: 'Feature',
      component: () => import('@/views/settings/Feature'),
      meta: {
        title: i18n.t('setting.Features'),
        icon: 'feature',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/auth',
      name: 'Auth',
      component: () => import('@/views/settings/Auth'),
      meta: {
        title: i18n.t('setting.Auth'),
        icon: 'attestation',
        permissions: ['settings.change_auth']
      }
    },
    {
      path: '/settings/storage',
      component: empty,
      redirect: '',
      meta: {
        title: i18n.t('setting.Storage'),
        app: 'terminal',
        permissions: ['settings.change_terminal']
      },
      children: [
        {
          path: '',
          name: 'Storage',
          component: () => import('@/views/settings/Storage'),
          meta: {
            title: i18n.t('setting.Storage'),
            icon: 'terminal-set',
            permissions: ['settings.change_terminal']
          }
        },
        {
          path: 'replay-storage/create',
          name: 'CreateReplayStorage',
          component: () => import('@/views/settings/Storage/ReplayStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.CreateReplayStorage'),
            activeMenu: '/settings/storage',
            permissions: ['terminal.add_replaystorage']
          },
          hidden: true
        },
        {
          path: 'replay-storage/:id/update',
          name: 'ReplayStorageUpdate',
          component: () => import('@/views/settings/Storage/ReplayStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.ReplayStorageUpdate'),
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
            title: i18n.t('route.CreateCommandStorage'),
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
            title: i18n.t('route.CommandStorageUpdate'),
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
      redirect: '',
      meta: {
        title: i18n.t('setting.Terminal'),
        app: 'terminal',
        permissions: ['settings.change_terminal']
      },
      children: [
        {
          path: '',
          name: 'TerminalSetting',
          component: () => import('@/views/settings/Terminal'),
          meta: {
            title: i18n.t('setting.Terminal'),
            icon: 'terminal-set',
            permissions: ['settings.change_terminal']
          }
        },
        {
          path: ':id',
          name: 'TerminalDetail',
          component: () => import('@/views/settings/Terminal/Component/TerminalDetail'),
          meta: {
            title: i18n.t('route.Terminal'),
            permissions: ['terminal.view_terminal']
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TerminalUpdate',
          component: () => import('@/views/settings/Terminal/Component/TerminalUpdate'),
          meta: {
            title: i18n.t('route.Terminal'),
            permissions: ['terminal.change_terminal']
          },
          hidden: true
        },
        {
          path: 'endpoint/create',
          name: 'EndpointCreate',
          component: () => import('@/views/settings/Terminal/Endpoint/EndpointCreateUpdate'),
          meta: {
            title: i18n.t('route.CreateEndpoint'),
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
            title: i18n.t('route.UpdateEndpoint'),
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
            title: i18n.t('route.CreateEndpointRule'),
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
            title: i18n.t('route.UpdateEndpointRule'),
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
      redirect: '',
      meta: {
        title: i18n.t('setting.Applets'),
        app: 'terminal',
        permissions: ['terminal.view_applet']
      },
      children: [
        {
          path: '',
          name: 'Applets',
          component: () => import('@/views/settings/Applet'),
          meta: {
            title: i18n.t('setting.Applets'),
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
            title: i18n.t('route.AppletDetail'),
            permissions: ['settings.change_terminal'],
            activeMenu: '/settings/applets'
          }
        },
        {
          path: 'hosts/create',
          name: 'AppletHostCreate',
          component: () => import('@/views/settings/Applet/AppletHost/AppletHostCreateUpdate'),
          hidden: true,
          meta: {
            title: i18n.t('route.AppletHostCreate'),
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
            title: i18n.t('route.AppletHostDetail'),
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
            title: i18n.t('route.AppletHostUpdate'),
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
            title: i18n.t('route.VirtualAppCreate'),
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
            title: i18n.t('route.AppletHostDetail'),
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
            title: i18n.t('route.AppletHostUpdate'),
            permissions: ['terminal.change_virtualapp'],
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
        title: i18n.t('setting.Security'),
        icon: 'security',
        permissions: ['settings.change_security']
      }
    },
    {
      path: '/settings/interface',
      name: 'Interface',
      component: () => import('@/views/settings/Interface'),
      meta: {
        title: i18n.t('xpack.InterfaceSettings'),
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
        title: i18n.t('setting.SystemTools'),
        icon: 'tools',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/tasks',
      component: empty,
      meta: {
        title: i18n.t('route.TaskList'),
        icon: 'tasks',
        permissions: ['ops.view_celerytask']
      },
      children: [
        {
          path: '',
          name: 'TaskList',
          component: () => import('@/views/settings/Task/index.vue'),
          meta: {
            title: i18n.t('route.TaskList'),
            permissions: ['ops.view_celerytask']
          }
        },
        {
          path: ':id',
          component: () => import('@/views/settings/Task/TaskDetail'),
          name: 'TaskDetail',
          hidden: true,
          meta: {
            title: i18n.t('route.TaskDetail'),
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
        title: i18n.t('setting.License'),
        icon: 'license',
        permissions: ['settings.change_license']
      }
    }
  ]
}

