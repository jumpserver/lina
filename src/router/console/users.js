import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'users',
    component: empty, // Parent router-view
    redirect: '',
    meta: {
      permissions: ['users.view_user'],
      expanded: true,
      icon: 'user-o'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/users/User/UserList.vue'), // Parent router-view
        name: 'UserList',
        meta: {
          title: i18n.t('UserList')
        }
      },
      {
        path: 'create',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserCreate',
        hidden: true,
        meta: {
          title: i18n.t('UserCreate'),
          action: 'create'
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserUpdate',
        hidden: true,
        meta: {
          title: i18n.t('UserUpdate'),
          action: 'update'
        }
      },
      {
        path: ':id',
        component: () => import('@/views/users/User/UserDetail'), // Parent router-view
        name: 'UserDetail',
        hidden: true,
        meta: { title: i18n.t('UserDetail') }
      }
    ]
  },
  {
    path: 'groups',
    component: empty,
    redirect: '',
    meta: {
      resource: 'usergroup',
      permissions: ['users.view_usergroup'],
      icon: 'user-group'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/users/Group/UserGroupList.vue'), // Parent router-view
        name: 'UserGroupList',
        meta: { title: i18n.t('UserGroupList'), permissions: ['users.view_usergroup'] }
      },
      {
        path: 'create',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupCreate',
        hidden: true,
        meta: {
          title: i18n.t('UserGroupCreate')
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupUpdate',
        hidden: true,
        meta: { title: i18n.t('UserGroupUpdate') }
      },
      {
        path: ':id',
        component: () => import('@/views/users/Group/UserGroupDetail'), // Parent router-view
        name: 'UserGroupDetail',
        hidden: true,
        meta: { title: i18n.t('UserGroupDetail') }
      }
    ]
  }
]
