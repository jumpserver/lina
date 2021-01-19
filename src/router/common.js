import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'

/**
 * admin and user routes
 * the routes that need to be dynamically loaded based on admin or user roles
 */
export default [
  {
    path: '/users/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'UserProfile',
        component: () => import('@/userviews/users/UserProfile/index'),
        meta: { title: i18n.t('route.UserProfile'), icon: 'user', activeMenu: '/users/profile' }
      }
    ]
  },
  {
    path: '/users/first-login',
    component: Layout,
    meta: { title: i18n.t('route.UserFirstLogin'), icon: 'user' },
    children: [
      {
        path: 'personal-information-improvement/',
        component: () => import('@/userviews/users/UserFirstLogin/PersonalInformationImprovement/index'),
        name: 'PersonalInformationImprovement',
        meta: { title: i18n.t('route.PersonalInformationImprovement') }
      },
      {
        path: 'guide/',
        component: () => import('@/userviews/users/UserFirstLogin/UserGuide/index'),
        name: 'UserGuide',
        meta: { title: i18n.t('route.UserGuide') }
      }
    ],
    hidden: true
  },
  {
    path: '/ops/celery/task/:id/log/',
    component: () => import('@/views/ops/CeleryTaskLog'),
    name: 'CeleryTaskLog',
    hidden: true,
    meta: { title: i18n.t('route.CeleryTaskLog'), roles: ['SuperAdmin', 'Admin', 'Auditor', 'User'] }
  },
  {
    path: '/ops/task/task/:id/log/',
    component: () => import('@/views/ops/CeleryTaskLog'),
    name: 'TaskLog',
    hidden: true,
    meta: { title: i18n.t('route.CeleryTaskLog'), roles: ['SuperAdmin', 'Admin', 'Auditor', 'User'] }
  }
]
