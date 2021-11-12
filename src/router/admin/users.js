import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'users',
    component: empty, // Parent router-view
    redirect: '',
    meta: {
      permissions: ['users.view_user']
    },
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
        meta: {
          title: i18n.t('route.UserCreate'),
          activeMenu: 'UserList',
          action: 'create',
          hidden: true
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserUpdate',
        meta: {
          title: i18n.t('route.UserUpdate'),
          activeMenu: 'UserList',
          action: 'update',
          hidden: true
        }
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
        hidden: true,
        meta: { title: i18n.t('route.UserAclList') },
        children: [
          {
            path: '',
            name: 'UserAclList',
            component: () => import('@/views/acl/UserAcl/UserAclList'),
            hidden: true,
            meta: { title: i18n.t('route.UserAclList'), activeMenu: 'UserList' }
          },
          {
            path: 'create',
            name: 'UserAclCreate',
            component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('route.UserAclCreate'), activeMenu: 'UserList' }
          },
          {
            path: ':id',
            name: 'UserAclDetail',
            component: () => import('@/views/acl/UserAcl/UserAclDetail'),
            hidden: true,
            meta: { title: i18n.t('route.UserAclDetail'), activeMenu: 'UserList' }
          },
          {
            path: ':id/update',
            name: 'UserAclUpdate',
            component: () => import('@/views/acl/UserAcl/UserAclCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('route.UserAclUpdate') }
          }
        ]
      }
    ]
  },
  {
    path: 'user-groups',
    component: empty,
    redirect: '',
    meta: {},
    children: [
      {
        path: 'create',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupCreate',
        meta: {
          title: i18n.t('route.UserGroupCreate')
          // activeMenu: 'UserGroupList',
          // hidden: true
        }
      },
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
        path: ':id',
        component: () => import('@/views/users/Group/UserGroupDetail'), // Parent router-view
        name: 'UserGroupDetail',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupDetail'), activeMenu: 'UserGroupList' }
      }
    ]
  }
]
