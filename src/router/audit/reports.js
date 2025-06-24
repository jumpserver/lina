import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'users',
    name: 'writable',
    component: empty,
    meta: {
      title: i18n.t('UserActivity'),
      icon: 'user-o',
      permissions: []
    },
    children: [
      {
        path: 'activity',
        name: 'UserActivityIndex',
        component: () => import('@/views/reports/users/index.vue'),
        meta: {
          title: i18n.t('UserActivity'),
          permissions: []
        }
      }
    ]
  },
  {
    path: 'assets',
    name: 'assets',
    component: empty,
    meta: {
      icon: 'assets',
      title: i18n.t('GroupActivity'),
      permissions: []
    },
    children: [
      {
        path: 'activity',
        props: () => ({ nav: false }),
        name: 'AssetActivityIndex',
        component: () => import('@/views/reports/assets/index.vue'),
        meta: {
          title: i18n.t('AssetActivity'),
          permissions: []
        }
      }
    ]
  }
]
