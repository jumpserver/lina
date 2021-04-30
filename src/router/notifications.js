import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'notifications',
    component: empty,
    redirect: '',
    meta: {
      title: i18n.t('route.Notifications'),
      licenseRequired: true
    },
    children: [
      {
        path: 'subscription',
        name: 'Notification',
        component: () => import('@/views/notifications/Subscriptions'),
        meta: { title: i18n.t('notifications.Subscription'), activeMenu: '/notification/subscription' }
      }
    ]
  }
]
