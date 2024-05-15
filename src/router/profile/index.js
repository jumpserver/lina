import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import empty from '@/layout/empty.vue'

export default {
  path: '/profile',
  redirect: '/profile/index',
  component: Layout,
  meta: {
    title: i18n.t('PersonalSettings'),
    icon: 'personal',
    view: 'profile',
    type: 'view',
    showNavSwitcher: false,
    showOrganization: false,
    permissions: []
  },
  children: [
    {
      path: '/profile/index',
      name: 'Profile',
      component: () => import('@/views/profile/index'),
      meta: {
        title: i18n.t('Profile'),
        icon: 'attestation',
        permissions: []
      }
    },
    {
      path: '/profile/password-and-ssh-key',
      name: 'PasswordAndSSHKey',
      component: () => import('@/views/profile/PasswordAndSSHKey/index'),
      meta: {
        title: i18n.t('PasswordAndSSHKey'),
        icon: 'personal',
        permissions: []
      }
    },
    {
      path: '/profile/passkeys',
      name: 'Passkey',
      component: () => import('@/views/profile/PassKey'),
      meta: {
        title: 'Passkeys',
        icon: 'passkey',
        hidden: ({ settings }) => !settings['AUTH_PASSKEY'],
        permissions: ['authentication.view_passkey']
      }
    },
    {
      path: '/profile/access-keys',
      component: empty,
      meta: {
        icon: 'key'
      },
      redirect: '',
      children: [
        {
          path: '',
          component: () => import('@/views/profile/AccessKey/index'),
          name: 'AccessKey',
          icon: 'key',
          meta: { title: i18n.t('AccessKey'), permissions: ['authentication.view_accesskey'] }
        },
        {
          path: ':id/update',
          component: () => import('@/views/profile/AccessKey/CreateUpdate'),
          name: 'AccessKeyCreateUpdate',
          hidden: true,
          meta: {
            title: i18n.t('AccessKey'),
            permissions: ['authentication.change_accesskey'],
            activeMenu: '/profile/access-keys'
          }
        }
      ]
    },
    {
      path: '/profile/temp-token',
      component: () => import('@/views/profile/TempToken'),
      name: 'TempToken',
      meta: {
        title: i18n.t('TempToken'),
        icon: 'magic',
        hidden: ({ settings }) => !settings['AUTH_TEMP_TOKEN'],
        permissions: ['authentication.view_temptoken'],
        activeMenu: '/profile/temp-token'
      }
    },
    {
      path: '/profile/connection-token',
      component: () => import('@/views/profile/ConnectionToken'),
      name: 'ConnectionToken',
      meta: {
        title: i18n.t('ConnectionToken'),
        icon: 'token',
        permissions: ['authentication.view_connectiontoken']
      }
    },
    {
      path: '/profile/preferences',
      name: 'Preferences',
      component: () => import('@/views/profile/Preferences/index'),
      meta: {
        title: i18n.t('Preferences'),
        icon: 'preference',
        permissions: []
      }
    },
    {
      path: '/profile/improvement',
      component: () => import('@/views/profile/Improvement'),
      name: 'Improvement',
      hidden: true,
      meta: { title: i18n.t('PersonalInformationImprovement'), permissions: [] }
    }
  ]
}
