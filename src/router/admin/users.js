import i18n from '@/i18n/i18n'
export default [
  {
    path: 'users',
    component: () => import('@/views/users/users/UserList.vue'), // Parent router-view
    name: 'UserList',
    meta: { title: i18n.t('route.UserList') }
  },
  {
    path: 'users/create',
    component: () => import('@/views/users/users/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserCreate',
    hidden: true,
    meta: { title: i18n.t('route.UserCreate'), activeMenu: '/users/users', action: 'create' }
  },
  {
    path: 'users/:id/update',
    component: () => import('@/views/users/users/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserUpdate',
    hidden: true,
    meta: { title: i18n.t('route.UserUpdate'), activeMenu: '/users/users', action: 'update' }
  },
  {
    path: 'users/:id',
    component: () => import('@/views/users/users/UserDetail/index.vue'), // Parent router-view
    name: 'UserDetail',
    hidden: true,
    meta: { title: i18n.t('route.UserDetail'), activeMenu: '/users/users' }
  },
  {
    path: 'groups',
    component: () => import('@/views/users/groups/UserGroupList.vue'), // Parent router-view
    name: 'UserGroupList',
    meta: { title: i18n.t('route.UserGroupList') }
  },
  {
    path: 'groups/:id/update',
    component: () => import('@/views/users/groups/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupUpdate',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupUpdate'), activeMenu: '/users/groups' }
  },
  {
    path: 'groups/create',
    component: () => import('@/views/users/groups/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupCreate',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupCreate'), activeMenu: '/users/groups' }
  },
  {
    path: 'groups/:id',
    component: () => import('@/views/users/groups/UserGroupDetail/index.vue'), // Parent router-view
    name: 'UserGroupDetail',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupDetail'), activeMenu: '/users/groups' }
  }
]
