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
    path: 'user-acl',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.UserAclList') },
    hidden: true,
    children: [
      {
        path: '',
        name: 'UserAclList',
        component: () => import('@/views/acl/UserAcl/UserAclList'),
        meta: { title: i18n.t('route.UserAclList'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: 'create',
        name: 'UserAclCreate',
        component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
        meta: { title: i18n.t('route.UserAclCreate'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id',
        name: 'UserAclDetail',
        component: () => import('@/views/acl/UserAcl/UserAclDetail'),
        meta: { title: i18n.t('route.UserAclDetail'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id/update',
        name: 'UserAclUpdate',
        component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
        meta: { title: i18n.t('route.UserAclUpdate') },
        hidden: true
      }
    ]
  },
  {
    path: 'site-msg',
    component: empty,
    redirect: '',
    meta: { title: i18n.t('route.SiteMessage') },
    hidden: true,
    children: [
      {
        path: '',
        name: 'SiteMessageList',
        component: () => import('@/views/users/SiteMsg/SiteMsgList'),
        meta: { title: i18n.t('route.SiteMessageList'), activeMenu: '/users/users' },
        hidden: true
      },
      {
        path: ':id',
        name: 'SiteMessageDetail',
        component: () => import('@/views/users/SiteMsg/SiteMsgDetail'),
        meta: { title: i18n.t('route.SiteMessageDetail'), activeMenu: '/users/users' },
        hidden: true
      }
    ]
  }
]
