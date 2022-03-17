import i18n from '@/i18n/i18n'

/**
 * admin and user routes
 * the routes that need to be dynamically loaded based on admin or user roles
 */
export default [
  {
    path: '/ops/celery/task/:id/log/',
    component: () => import('@/views/ops/CeleryTaskLog'),
    name: 'CeleryTaskLog',
    hidden: true,
    meta: {
      title: i18n.t('route.CeleryTaskLog'),
      permissions: []
    }
  },
  {
    path: '/ops/task/task/:id/log/',
    component: () => import('@/views/ops/CeleryTaskLog'),
    name: 'TaskLog',
    hidden: true,
    meta: {
      title: i18n.t('route.CeleryTaskLog'),
      permissions: []
    }
  },
  {
    path: '/terminal/sessions/:id',
    name: 'OldSessionDetail',
    meta: {
      permissions: ['terminal.view_session']
    },
    hidden: true,
    beforeEnter: (to, from, next) => {
      next({ name: 'SessionDetail', params: to.params, query: to.query })
    }
  }
]
