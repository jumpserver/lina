import Layout from '@/layout'
import i18n from '@/i18n/i18n'

export default {
  path: '/profile',
  redirect: '/profile/info',
  component: Layout,
  meta: {
    title: i18n.t('route.UserProfile'),
    icon: 'personal',
    view: 'profile',
    type: 'view',
    showNavSwitcher: false,
    showOrganization: false,
    permissions: []
  },
  children: [
    {
      path: '/profile/info',
      name: 'ProfileInfo',
      component: () => import('@/views/profile/ProfileInfo'),
      meta: {
        title: i18n.t('users.UserInformation'),
        icon: 'attestation',
        permissions: []
      }
    },
    {
      path: '/profile/setting',
      name: 'ProfileSetting',
      component: () => import('@/views/profile/ProfileUpdate/index'),
      meta: {
        title: i18n.t('users.AuthSetting'),
        icon: 'personal',
        permissions: []
      }
    },
    {
      path: '/profile/user/setting',
      name: 'UserSetting',
      component: () => import('@/views/profile/UserSettingUpdate/index'),
      meta: {
        title: i18n.t('users.UserSetting'),
        icon: 'preference',
        permissions: []
      }
    },
    {
      path: '/profile/improvement',
      component: () => import('@/views/profile/ProfileImprovement'),
      name: 'ProfileImprovement',
      hidden: true,
      meta: { title: i18n.t('route.PersonalInformationImprovement'), permissions: [] }
    },
    {
      path: '/profile/api-keys',
      component: () => import('@/views/profile/ApiKey'),
      name: 'ApiKey',
      meta: {
        title: i18n.t('common.nav.APIKey'),
        icon: 'key',
        permissions: ['authentication.view_accesskey'],
        resource: 'accesskey',
        app: 'authentication'
      }
    },
    {
      path: '/profile/temp-password',
      component: () => import('@/views/profile/TempPassword'),
      name: 'TempPassword',
      meta: {
        title: i18n.t('common.nav.TempPassword'),
        icon: 'magic',
        hidden: ({ settings }) => !settings['AUTH_TEMP_TOKEN'],
        permissions: ['authentication.view_temptoken'],
        activeMenu: '/profile/temp-password'
      }
    },
    {
      path: '/profile/connection-token',
      component: () => import('@/views/profile/ConnectionToken'),
      name: 'ConnectionToken',
      meta: {
        title: i18n.t('common.nav.ConnectionToken'),
        icon: 'token',
        permissions: ['authentication.view_connectiontoken']
      }
    },
    {
      path: '/profile/passkeys',
      component: () => import('@/views/profile/PassKey.vue'),
      name: 'Passkey',
      meta: {
        title: i18n.t('common.nav.PassKey'),
        icon: 'passkey',
        hidden: ({ settings }) => !settings['AUTH_PASSKEY'],
        permissions: ['authentication.view_connectiontoken']
      }
    }
  ]
}
