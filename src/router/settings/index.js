import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default {
  path: '/settings',
  component: Layout,
  redirect: '/settings/basic',
  name: 'SystemSetting',
  meta: {
    title: i18n.t('route.Settings'),
    icon: 'el-icon-s-tools',
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
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/email',
      name: 'Email',
      component: () => import('@/views/settings/Email'),
      meta: {
        title: i18n.t('setting.Email'),
        icon: 'envelope-o',
        permissions: ['settings.change_email']
      }
    },
    {
      path: '/settings/auth',
      name: 'Auth',
      component: () => import('@/views/settings/Auth'),
      meta: {
        title: i18n.t('setting.Auth'),
        icon: 'user-circle-o',
        permissions: ['settings.change_auth']
      }
    },
    {
      path: '/settings/message',
      name: 'SysMessageSub',
      component: () => import('@/views/settings/Message'),
      meta: {
        title: i18n.t('setting.MessageSub'),
        icon: 'bell-o',
        permissions: ['settings.change_systemmsgsubscription']
      }
    },
    {
      path: '/settings/sms',
      name: 'SMS',
      component: () => import('@/views/settings/SMS'),
      meta: {
        title: i18n.t('setting.SMS'),
        icon: 'mobile-phone fa-lg',
        permissions: ['settings.change_sms'],
        licenseRequired: true
      }
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
            icon: 'tasks',
            permissions: ['settings.change_terminal']
          }
        },
        {
          path: ':id',
          name: 'TerminalDetail',
          component: () => import('@/views/settings/Terminal/TerminalDetail'),
          meta: {
            title: i18n.t('route.Terminal'),
            permissions: ['terminal.view_terminal']
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TerminalUpdate',
          component: () => import('@/views/settings/Terminal/TerminalUpdate'),
          meta: {
            title: i18n.t('route.Terminal'),
            permissions: ['terminal.change_terminal']
          },
          hidden: true
        },
        {
          path: 'replay-storage/create',
          name: 'CreateReplayStorage',
          component: () => import('@/views/settings/Terminal/Storage/ReplayStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.CreateReplayStorage'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.add_replaystorage']
          },
          hidden: true
        },
        {
          path: 'replay-storage/:id/update',
          name: 'ReplayStorageUpdate',
          component: () => import('@/views/settings/Terminal/Storage/ReplayStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.ReplayStorageUpdate'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.change_replaystorage']
          },
          hidden: true
        },
        {
          path: 'command-storage/create',
          name: 'CreateCommandStorage',
          component: () => import('@/views/settings/Terminal/Storage/CommandStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.CreateCommandStorage'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.add_commandstorage']
          },
          hidden: true
        },
        {
          path: 'command-storage/:id/update',
          name: 'CommandStorageUpdate',
          component: () => import('@/views/settings/Terminal/Storage/CommandStorageCreateUpdate'),
          meta: {
            title: i18n.t('route.CommandStorageUpdate'),
            activeMenu: '/settings/terminal',
            permissions: ['terminal.change_commandstorage']
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
      path: '/settings/security',
      name: 'Security',
      component: () => import('@/views/settings/Security'),
      meta: {
        title: i18n.t('setting.Security'),
        icon: 'shield',
        permissions: ['settings.change_security']
      }
    },
    {
      path: '/settings/clean',
      name: 'Clean',
      component: () => import('@/views/settings/Clean'),
      meta: {
        title: i18n.t('setting.Cleaning'),
        icon: 'hourglass-2',
        permissions: ['settings.change_clean']
      }
    },
    {
      path: '/settings/interface',
      name: 'Interface',
      component: () => import('@/views/settings/Interface'),
      meta: {
        title: i18n.t('xpack.InterfaceSettings'),
        icon: 'laptop',
        licenseRequired: true,
        permissions: ['settings.change_interface']
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
            icon: 'sitemap',
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
      path: '/settings/other',
      name: 'Other',
      component: () => import('@/views/settings/Other'),
      meta: {
        title: i18n.t('setting.Other'),
        icon: 'map-signs',
        permissions: ['settings.change_other']
      }
    },
    {
      path: '/settings/license',
      name: 'License',
      component: () => import('@/views/settings/License'),
      meta: {
        title: i18n.t('setting.License'),
        icon: 'diamond',
        permissions: ['settings.change_license']
      }
    }
  ]
}

