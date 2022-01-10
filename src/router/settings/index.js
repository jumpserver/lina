import Layout from '@/layout'
import i18n from '@/i18n/i18n'

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
    permissions: []
  },
  children: [
    {
      path: '/settings/basic',
      name: 'Settings',
      component: () => import('@/views/settings/Basic'),
      meta: {
        title: i18n.t('setting.Basic'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/email',
      name: 'Settings',
      component: () => import('@/views/settings/Email'),
      meta: {
        title: i18n.t('setting.Email'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/ldap',
      name: 'Ldap',
      component: () => import('@/views/settings/Ldap'),
      meta: {
        title: i18n.t('setting.Ldap'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/auth',
      name: 'Auth',
      component: () => import('@/views/settings/Auth'),
      meta: {
        title: i18n.t('setting.Auth'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/message',
      name: 'SysMessageSub',
      component: () => import('@/views/settings/MessageSub/Subscription'),
      meta: {
        title: i18n.t('setting.MessageSub'),
        icon: 'gear',
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
      name: 'Terminal',
      component: () => import('@/views/settings/Terminal'),
      meta: {
        title: i18n.t('setting.Terminal'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/security',
      name: 'Security',
      component: () => import('@/views/settings/Security'),
      meta: {
        title: i18n.t('setting.Security'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/clean',
      name: 'Clean',
      component: () => import('@/views/settings/Clean'),
      meta: {
        title: i18n.t('setting.Cleaning'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/other',
      name: 'Other',
      component: () => import('@/views/settings/Other'),
      meta: {
        title: i18n.t('setting.Other'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    },
    {
      path: '/settings/license',
      name: 'License',
      component: () => import('@/views/settings/License'),
      meta: {
        title: i18n.t('setting.License'),
        icon: 'gear',
        permissions: ['settings.view_setting']
      }
    }
  ]
}

