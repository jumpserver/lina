import empty from '@/layout/empty.vue'
import i18n from '@/i18n/i18n'

export default [

  {
    path: 'sessions',
    name: 'AccountSession',
    component: empty,
    meta: {
      app: 'terminal',
      name: 'BaseAccountSession',
      icon: 'session',
      resource: 'session',
      permissions: []
    },
    children: [
      {
        path: '',
        component: () => import('@/views/sessions/SessionList/index.vue'),
        name: 'AccountSessionList',
        meta: {
          title: i18n.t('账号会话'),
          menuTitle: i18n.t('账号会话'),
          permissions: []
        }
      }
    ]
  },
  {
    path: 'activity',
    name: 'AccountActivity',
    component: empty,
    redirect: {
      name: 'AccountPushList'
    },
    meta: {
      app: 'accounts',
      name: 'BaseAccountActivity',
      icon: 'activity',
      resource: 'operate-logs'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/AccountActivity/AccountActivityList.vue'),
        name: 'AccountActivityList',
        meta: {
          title: i18n.t('活动记录'),
          menuTitle: i18n.t('活动记录'),
          permissions: ['audits.view_operatelog']
        }
      }
    ]
  }
]