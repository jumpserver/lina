import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default {
  path: '/settings',
  component: Layout,
  redirect: '/settings/basic',
  meta: {
    title: i18n.t('route.Settings'),
    icon: 'gear',
    activeMenu: '/settings',
    view: 'settings',
    type: 'view',
    showNavSwitcher: false,
    showOrganization: false,
    permissions: []
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
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/auth',
      name: 'Auth',
      component: () => import('@/views/settings/Auth'),
      meta: {
        title: i18n.t('setting.Auth'),
        icon: 'user-circle-o',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/message',
      name: 'SysMessageSub',
      component: () => import('@/views/settings/MessageSub'),
      meta: {
        title: i18n.t('setting.MessageSub'),
        icon: 'bell-o',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/sms',
      name: 'SMS',
      component: () => import('@/views/settings/SMS'),
      hidden: () => {
        return !this.$store.getters.hasValidLicense
      },
      meta: {
        title: i18n.t('setting.SMS'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/terminal',
      component: empty,
      redirect: '',
      meta: {
        title: i18n.t('setting.Terminal'),
        permissions: ['settings.view_setting']
      },
      children: [
        {
          path: '',
          name: 'TerminalList',
          component: () => import('@/views/settings/Terminal/index'),
          meta: {
            title: i18n.t('setting.Terminal'),
            icon: 'terminal',
            permissions: ['terminal.view_command'],
            resource: 'terminal',
            app: 'terminal'
          }
        },
        {
          path: ':id',
          name: 'TerminalDetail',
          component: () => import('@/views/settings/Terminal/TerminalDetail'),
          meta: {
            permissions: ['terminal.view_command']
          },
          hidden: true
        },
        {
          path: ':id/update',
          name: 'TerminalUpdate',
          component: () => import('@/views/settings/Terminal/TerminalUpdate'),
          meta: {
            permissions: ['terminal.view_command']
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
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/clean',
      name: 'Clean',
      component: () => import('@/views/settings/Clean'),
      meta: {
        title: i18n.t('setting.Cleaning'),
        icon: 'hourglass-2',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/other',
      name: 'Other',
      component: () => import('@/views/settings/Other'),
      meta: {
        title: i18n.t('setting.Other'),
        icon: 'map-signs',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/license',
      name: 'License',
      component: () => import('@/views/settings/License'),
      meta: {
        title: i18n.t('setting.License'),
        icon: 'diamond',
        permissions: ['settings.view_setting']
      }
    }
  ]
}

