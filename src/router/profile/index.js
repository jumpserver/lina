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
    permissions: []
  },
  children: [
    {
      path: '/profile/info',
      name: 'ProfileInfo',
      component: () => import('@/views/profile/UserProfile/ProfileInfo'),
      meta: {
        title: i18n.t('users.AccountInformation'),
        icon: 'adjust',
        permissions: []
      }
    },
    {
      path: '/profile/setting',
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
