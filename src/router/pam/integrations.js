import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [
  {
    path: 'services',
    name: 'Services',
    component: empty,
    redirect: {
      name: 'IntegrationApplicationList'
    },
    meta: {
      app: 'accounts',
      name: 'Service',
      icon: 'service',
      resource: 'integrationapplicaion'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/Integration/index.vue'),
        name: 'IntegrationApplicationList',
        meta: {
          title: i18n.t('Applications'),
          permissions: ['accounts.view_integrationapplication']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/Integration/ApplicationCreateUpdate.vue'),
        name: 'IntegrationApplicationCreate',
        hidden: true,
        meta: {
          title: i18n.t('IntegrationApplicationCreate'),
          permissions: ['accounts.add_integrationapplication']
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/Integration/ApplicationCreateUpdate.vue'),
        name: 'IntegrationApplicationUpdate',
        hidden: true,
        meta: {
          title: i18n.t('IntegrationApplicationUpdate'),
          permissions: ['accounts.change_integrationapplication']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/Integration/ApplicationDetail/index.vue'),
        name: 'IntegrationApplicationDetail',
        hidden: true,
        meta: {
          title: i18n.t('ApplicationDetail'),
          permissions: ['accounts.view_integrationapplication']
        }
      }
    ]
  }
]
