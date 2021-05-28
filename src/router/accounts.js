import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'asset-accounts',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountList'),
        meta: { title: i18n.t('route.AssetAccount') }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AssetAccount/AssetAccountCreate'),
        name: 'AssetAccountCreate',
        meta: { title: i18n.t('accounts.Create'), activeMenu: '/accounts/asset-accounts/' },
        hidden: true
      }
    ]
  },
  {
    path: 'application-accounts',
    component: empty,
    meta: { title: i18n.t('route.AssetAccount') },
    children: [
      {
        path: '',
        name: 'ApplicationAccountList',
        component: () => import('@/views/accounts/ApplicationAccount/ApplicationAccountList'),
        meta: { title: i18n.t('route.ApplicationAccount') }
      }
    ]
  },
  {
    path: 'gathered-user',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('xpack.GatherUser.GatherUserList') },
    children: [
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/index'),
        name: 'GatherUserListIndex',
        meta: { title: i18n.t('xpack.GatherUser.GatherUser'), activeMenu: '/accounts/gathered-user' }
      },
      {
        path: '',
        component: () => import('@/views/accounts/GatheredUser/GatheredUserList'),
        name: 'GatherUserList',
        hidden: true,
        meta: { title: i18n.t('xpack.GatherUser.GatherUserList'), activeMenu: '/accounts/gathered-user' }
      },
      {
        path: 'tasks',
        component: () => import('@/views/accounts/GatheredUser/TaskList'),
        name: 'GatherUserTaskList',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskList'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/:id',
        component: () => import('@/views/accounts/GatheredUser/TaskDetail/index'),
        name: 'GatherUserTaskDetail',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskDetail'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/create',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskCreate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskCreate'), activeMenu: '/accounts/gathered-user' },
        hidden: true
      },
      {
        path: 'tasks/:id/update',
        component: () => import('@/views/accounts/GatheredUser/TaskCreateUpdate'),
        name: 'GatherUserTaskUpdate',
        meta: { title: i18n.t('xpack.GatherUser.GatherUserTaskUpdate'), action: 'update', activeMenu: '/accounts/gathered-user' },
        hidden: true
      }
    ]
  }
]
