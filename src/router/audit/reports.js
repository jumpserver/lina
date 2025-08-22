import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'users',
    name: 'writable',
    component: empty,
    meta: {
      title: i18n.t('UserReport'),
      icon: 'user-o',
      permissions: []
    },
    children: [
      {
        path: '',
        name: 'UserActivityIndex',
        component: () => import('@/views/reports/users/index.vue'),
        meta: {
          title: i18n.t('UserReport'),
          permissions: ['rbac.view_userloginreport | rbac.view_userchangepasswordreport']
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
      title: i18n.t('AssetReport'),
      permissions: []
    },
    children: [
      {
        path: '',
        props: () => ({ nav: false }),
        name: 'AssetActivityIndex',
        component: () => import('@/views/reports/assets/index.vue'),
        meta: {
          title: i18n.t('AssetReport'),
          permissions: ['rbac.view_assetactivityreport | rbac.view_assetstatisticsreport']
        }
      }
    ]
  },
  {
    path: 'accounts',
    name: 'accounts',
    component: empty,
    meta: {
      icon: 'accounts',
      title: i18n.t('AccountReport'),
      permissions: []
    },
    children: [
      {
        path: '',
        props: () => ({ nav: false }),
        name: 'AccountActivityIndex',
        component: () => import('@/views/reports/accounts/index.vue'),
        meta: {
          title: i18n.t('AccountReport'),
          permissions: ['rbac.view_accountstatisticsreport | rbac.view_accountautomationreport']
        }
      }
    ]
  }
]
