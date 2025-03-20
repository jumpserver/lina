import empty from '@/layout/empty'
import i18n from '@/i18n/i18n'

const clouds = {
  path: 'cloud',
  component: empty,
  redirect: {
    name: 'CloudAccountList'
  },
  hidden: true,
  meta: {
    app: 'xpack',
    resource: 'account'
  },
  children: [
    {
      path: '',
      name: 'CloudAccountList',
      component: () => import('@/views/assets/Cloud'),
      hidden: true,
      meta: {
        title: i18n.t('CloudSync')
      }
    },
    {
      path: 'account',
      component: empty,
      hidden: true,
      redirect: {
        name: 'AccountList'
      },
      meta: {
        title: i18n.t('BaseCloudAccountList'),
        permissions: ['xpack.view_account']
      },
      children: [
        {
          path: '',
          name: 'AccountList',
          hidden: true,
          redirect: '/console/assets/cloud',
          meta: {
            title: i18n.t('CloudSync'),
            permissions: ['xpack.view_account']
          }
        },
        {
          path: ':id/',
          component: () => import('@/views/assets/Cloud/Account/AccountDetail/index'),
          name: 'CloudAccountDetail',
          hidden: true,
          meta: {
            title: i18n.t('CloudAccountDetail'),
            permissions: ['xpack.view_account']
          }
        }
      ]
    },
    {
      path: 'strategy',
      component: empty,
      hidden: true,
      redirect: {
        name: 'CloudStrategyList'
      },
      meta: {
        title: i18n.t('Strategy'),
        permissions: ['xpack.view_strategy']
      },
      children: [
        {
          path: '',
          name: 'CloudStrategyList',
          hidden: true,
          component: () => import('@/views/assets/Cloud/'),
          meta: {
            title: i18n.t('StrategyList'),
            permissions: ['xpack.view_strategy']
          }
        },
        {
          path: 'create',
          component: () => import('@/views/assets/Cloud/Strategy/StrategyCreateUpdate'),
          name: 'CloudStrategyCreate',
          hidden: true,
          meta: {
            title: i18n.t('StrategyCreate'),
            action: 'create',
            permissions: ['xpack.add_strategy']
          }
        },
        {
          path: ':id/update',
          component: () => import('@/views/assets/Cloud/Strategy/StrategyCreateUpdate'),
          name: 'CloudStrategyUpdate',
          hidden: true,
          meta: {
            title: i18n.t('StrategyUpdate'),
            permissions: ['xpack.change_strategy']
          }
        },
        {
          path: ':id/',
          component: () => import('@/views/assets/Cloud/Strategy/StrategyDetail/index'),
          name: 'CloudStrategyDetail',
          hidden: true,
          meta: {
            title: i18n.t('StrategyDetail'),
            permissions: ['xpack.view_strategy']
          }
        }
      ]
    }
  ]
}

function setChildrenActiveMenu(children, activeMenu) {
  for (const item of children) {
    item.meta.activeMenu = activeMenu
    if (item.children) {
      setChildrenActiveMenu(item.children, activeMenu)
    }
  }
}

setChildrenActiveMenu(clouds.children, '/console/assets/assets')
export default [
  clouds
]
