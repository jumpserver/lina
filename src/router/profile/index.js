import Layout from '@/layout'
import i18n from '@/i18n/i18n'

export default {
  path: '/users/profile',
  redirect: '/users/profile-info',
  component: Layout,
  meta: {
    title: i18n.t('route.UserProfile'),
    icon: 'gear',
    view: 'users',
    type: 'view',
    showNavSwitcher: false,
    permissions: []
  },
  children: [
    {
      path: '/users/profile-info',
      name: 'profileInfo',
      component: () => import('@/views/profile/UserProfile/ProfileInfo'),
      meta: {
        title: i18n.t('users.AccountInformation'),
        icon: 'adjust',
        permissions: []
      }
    },
    {
      path: '/users/profile-setting',
      name: 'profileSetting',
      component: () => import('@/views/profile/UserProfile/index'),
      meta: {
        title: i18n.t('users.PersonalSetting'),
        icon: 'user-circle',
        permissions: []
      }
    }
  ]
}
