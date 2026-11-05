import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'
import { getConnectivityConfig } from '@/views/accounts/Connectivity/config'

const configs = ['account', 'asset'].map(getConnectivityConfig)

export default {
  path: 'connectivity',
  name: 'Connectivity',
  component: empty,
  redirect: { name: 'ConnectivityList' },
  meta: { title: i18n.t('ConnectivityTests'), icon: 'scan' },
  children: [
    {
      path: '',
      name: 'ConnectivityList',
      component: () => import('@/views/accounts/Connectivity/index.vue'),
      meta: {
        title: i18n.t('ConnectivityTests'),
        permissions: [
          configs.flatMap((c) => [c.viewPermission, c.viewExecutionPermission]).join(' | ')
        ]
      }
    },
    ...configs.flatMap((config) => {
      const meta = {
        app: config.app,
        resource: config.resource,
        connectivityType: config.type,
        activeMenu: '/pam/automations/connectivity'
      }
      return [
        {
          path: `${config.type}/create`,
          name: config.createRoute,
          component: () => import('@/views/accounts/Connectivity/CreateUpdate.vue'),
          hidden: true,
          meta: {
            ...meta,
            title: i18n.t(`${config.prefix}Create`),
            action: 'create',
            permissions: [config.addPermission]
          }
        },
        {
          path: `${config.type}/:id/update`,
          name: config.updateRoute,
          component: () => import('@/views/accounts/Connectivity/CreateUpdate.vue'),
          hidden: true,
          meta: {
            ...meta,
            title: i18n.t(`${config.prefix}Update`),
            action: 'update',
            permissions: [config.changePermission]
          }
        },
        {
          path: `${config.type}/:id`,
          name: config.detailRoute,
          component: () => import('@/views/accounts/Connectivity/Detail.vue'),
          hidden: true,
          meta: {
            ...meta,
            title: i18n.t(config.prefix),
            permissions: [config.viewPermission]
          }
        },
        {
          path: `${config.type}/executions/:id`,
          name: config.executionDetailRoute,
          component: () => import('@/views/accounts/Connectivity/ExecutionDetail.vue'),
          hidden: true,
          meta: {
            ...meta,
            resource: config.executionResource,
            title: i18n.t('ExecutionDetail'),
            permissions: [config.viewExecutionPermission]
          }
        }
      ]
    })
  ]
}
