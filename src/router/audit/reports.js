import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'users',
    name: 'writable',
    component: empty,
    meta: {
      title: i18n.t('UserActivity'),
      permissions: []
    },
    children: [
      {
        path: 'activity',
        name: 'UserActivity',
        component: () => import('@/views/reports/Users/UserActivity'),
        meta: {
          title: i18n.t('UserActivity'),
          permissions: []
        }
      },
      {
        path: 'activity1',
        name: 'UserActivity1',
        component: () => import('@/views/reports/Users/UserActivity'),
        meta: {
          title: i18n.t('UserActivity1'),
          permissions: []
        }
      }
    ]
  }
]
