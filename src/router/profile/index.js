import Layout from '@/layout'
import i18n from '@/i18n/i18n'

export default {
  path: '/profile',
  redirect: '/profile/info',
  component: Layout,
  meta: {
    title: i18n.t('route.UserProfile'),
    icon: 'gear',
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
        title: i18n.t('users.AccountInformation'),
        icon: 'adjust',
        permissions: []
      }
    },
    {
      path: '/profile/setting',
      name: 'ProfileSetting',
      component: () => import('@/views/profile/ProfileUpdate/index'),
      meta: {
        title: i18n.t('users.Profile'),
        icon: 'user-circle',
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
      path: '/profile/key',
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
      path: '/profile/tempPassword',
      component: () => import('@/views/profile/TempPassword'),
      name: 'TempPassword',
      meta: {
        title: i18n.t('common.nav.TempPassword'),
        icon: 'magic',
        permissions: []
      }
    }
  ]
}
