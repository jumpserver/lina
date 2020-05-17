export default [
  {
    path: 'users',
    component: () => import('@/views/users/users/UserList.vue'), // Parent router-view
    name: 'UserList',
    meta: { title: 'UserList' }
  },
  {
    path: 'users/create',
    component: () => import('@/views/users/users/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserCreate',
    hidden: true,
    meta: { title: 'UserCreate', activeMenu: '/users/users', action: 'create' }
  },
  {
    path: 'users/:id/update',
    component: () => import('@/views/users/users/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserUpdate',
    hidden: true,
    meta: { title: 'UserUpdate', activeMenu: '/users/users', action: 'update' }
  },
  {
    path: 'users/:id',
    component: () => import('@/views/users/users/UserDetail/index.vue'), // Parent router-view
    name: 'UserDetail',
    hidden: true,
    meta: { title: 'UserDetail', activeMenu: '/users/users' }
  },
  {
    path: 'groups',
    component: () => import('@/views/users/groups/UserGroupList.vue'), // Parent router-view
    name: 'UserGroupList',
    meta: { title: 'UserGroupList' }
  },
  {
    path: 'groups/:id/update',
    component: () => import('@/views/users/groups/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupUpdate',
    hidden: true,
    meta: { title: 'UserGroupUpdate', activeMenu: '/users/groups' }
  },
  {
    path: 'groups/create',
    component: () => import('@/views/users/groups/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupCreate',
    hidden: true,
    meta: { title: 'UserGroupCreate', activeMenu: '/users/groups' }
  },
  {
    path: 'groups/:id',
    component: () => import('@/views/users/groups/UserGroupDetail/index.vue'), // Parent router-view
    name: 'UserGroupDetail',
    hidden: true,
    meta: { title: 'UserGroupDetail', activeMenu: '/users/groups' }
  }
]
