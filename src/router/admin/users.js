import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'
export default [
  {
    path: 'users',
    component: empty, // Parent router-view
    redirect: '',
    children: [
      {
        path: '',
        component: () => import('@/views/users/User/UserList.vue'), // Parent router-view
        name: 'UserList',
        meta: { title: i18n.t('route.UserList') }
      },
      {
        path: 'create',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserCreate',
        hidden: true,
        meta: { title: i18n.t('route.UserCreate'), activeMenu: 'UserList', action: 'create' }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserUpdate',
        hidden: true,
        meta: { title: i18n.t('route.UserUpdate'), activeMenu: 'UserList', action: 'update' }
      },
      {
        path: ':id',
        component: () => import('@/views/users/User/UserDetail'), // Parent router-view
        name: 'UserDetail',
        hidden: true,
        meta: { title: i18n.t('route.UserDetail'), activeMenu: 'UserList' }
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
            meta: { title: i18n.t('route.UserAclList'), activeMenu: 'UserList' },
            hidden: true
          },
          {
            path: 'create',
            name: 'UserAclCreate',
            component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
            meta: { title: i18n.t('route.UserAclCreate'), activeMenu: 'UserList' },
            hidden: true
          },
          {
            path: ':id',
            name: 'UserAclDetail',
            component: () => import('@/views/acl/UserAcl/UserAclDetail'),
            meta: { title: i18n.t('route.UserAclDetail'), activeMenu: 'UserList' },
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
      }
    ]
  },
  {
    path: 'groups',
    component: empty, // Parent router-view
    redirect: '',
    children: [
      {
        path: '',
        component: () => import('@/views/users/Group/UserGroupList.vue'), // Parent router-view
        name: 'UserGroupList',
        meta: { title: i18n.t('route.UserGroupList') }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupUpdate',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupUpdate'), activeMenu: 'UserGroupList' }
      },
      {
        path: 'create',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupCreate',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupCreate'), activeMenu: 'UserGroupList' }
      },
      {
        path: ':id',
        component: () => import('@/views/users/Group/UserGroupDetail'), // Parent router-view
        name: 'UserGroupDetail',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupDetail'), activeMenu: 'UserGroupList' }
      }
    ]
  }
]
