import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'users',
    component: () => import('@/views/users/User/UserList.vue'), // Parent router-view
    name: 'UserList',
    meta: { title: i18n.t('route.UserList') }
  },
  {
    path: 'users/create',
    component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserCreate',
    hidden: true,
    meta: { title: i18n.t('route.UserCreate'), activeMenu: '/users/users', action: 'create' }
  },
  {
    path: 'users/:id/update',
    component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
    name: 'UserUpdate',
    hidden: true,
    meta: { title: i18n.t('route.UserUpdate'), activeMenu: '/users/users', action: 'update' }
  },
  {
    path: 'users/:id',
    component: () => import('@/views/users/User/UserDetail/index.vue'), // Parent router-view
    name: 'UserDetail',
    hidden: true,
    meta: { title: i18n.t('route.UserDetail'), activeMenu: '/users/users' }
  },
  {
    path: 'groups',
    component: () => import('@/views/users/Group/UserGroupList.vue'), // Parent router-view
    name: 'UserGroupList',
    meta: { title: i18n.t('route.UserGroupList') }
  },
  {
    path: 'groups/:id/update',
    component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupUpdate',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupUpdate'), activeMenu: '/users/groups' }
  },
  {
    path: 'groups/create',
    component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
    name: 'UserGroupCreate',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupCreate'), activeMenu: '/users/groups' }
  },
  {
    path: 'groups/:id',
    component: () => import('@/views/users/Group/UserGroupDetail/index.vue'), // Parent router-view
    name: 'UserGroupDetail',
    hidden: true,
    meta: { title: i18n.t('route.UserGroupDetail'), activeMenu: '/users/groups' }
  },
  {
    path: 'user-login-acl',
    component: empty,
    redirect: '',
    children: [
      {
        path: 'create',
        name: 'UserLoginACLCreate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
        meta: { title: i18n.t('route.UserLoginACLCreate'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id',
        name: 'UserLoginACLDetail',
        component: () => import('@/views/acl/UserLoginACL/UserDetail'),
        meta: { title: i18n.t('route.UserLoginACL'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'UserLoginACLUpdate',
        component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
        meta: { title: i18n.t('route.UserLoginACLUpdate'), activeMenu: '/users/users' },
        hidden: true
      }
    ]
  }
]
