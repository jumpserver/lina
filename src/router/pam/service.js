import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'services',
    name: 'ServiceIntegration',
    component: empty,
    redirect: {
      name: 'ServiceIntegrationList'
    },
    meta: {
      app: 'accounts',
      name: 'ServiceIntegration',
      icon: 'service',
      resource: 'serviceintegration'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/pam/ServiceIntegration/index.vue'),
        name: 'ServiceIntegrationList',
        meta: {
          title: i18n.t('ServiceIntegration'),
          menuTitle: i18n.t('ServiceIntegration'),
          permissions: ['accounts.view_serviceintegration']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/pam/ServiceIntegration/ServiceIntegrationCreateUpdate.vue'),
        name: 'ServiceIntegrationCreate',
        hidden: true,
        meta: {
          title: i18n.t('ServiceIntegrationCreate'),
          permissions: ['accounts.add_serviceintegration']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/pam/ServiceIntegration/ServiceIntegrationCreateUpdate.vue'),
        name: 'ServiceIntegrationUpdate',
        hidden: true,
        meta: {
          title: i18n.t('ServiceIntegrationUpdate'),
          permissions: ['accounts.change_serviceintegration']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/pam/ServiceIntegration/ServiceIntegrationDetail/index.vue'),
        name: 'ServiceIntegrationDetail',
        hidden: true,
        meta: {
          title: i18n.t('ServiceIntegrationDetail'),
          permissions: ['accounts.view_serviceintegration']
        }
      }
    ]
  }
]
