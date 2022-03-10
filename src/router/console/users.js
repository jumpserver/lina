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
        meta: {
          title: i18n.t('route.UserList')
        }
      },
      {
        path: 'create',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserCreate',
        hidden: true,
        meta: {
          title: i18n.t('route.UserCreate'),
          action: 'create'
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/User/UserCreateUpdate.vue'), // Parent router-view
        name: 'UserUpdate',
        hidden: true,
        meta: {
          title: i18n.t('route.UserUpdate'),
          action: 'update'
        }
      },
      {
        path: ':id',
        component: () => import('@/views/users/User/UserDetail'), // Parent router-view
        name: 'UserDetail',
        hidden: true,
        meta: { title: i18n.t('route.UserDetail') }
      },
      {
        path: 'user-acl',
        component: empty,
        redirect: '',
        hidden: true,
        meta: {
          title: i18n.t('route.UserLoginACLList'),
          app: 'acls',
          resource: 'loginacl'
        },
        children: [
          {
            path: '',
            name: 'UserLoginACLList',
            component: () => import('@/views/acl/UserLoginACL/UserLoginACLList'),
            hidden: true,
            meta: { title: i18n.t('route.UserLoginACLList') }
          },
          {
            path: 'create',
            name: 'UserLoginACLCreate',
            component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('route.UserLoginACLCreate') }
          },
          {
            path: ':id',
            name: 'UserLoginACLDetail',
            component: () => import('@/views/acl/UserLoginACL/UserDetail/index'),
            hidden: true,
            meta: { title: i18n.t('route.UserLoginACLDetail') }
          },
          {
            path: ':id/update',
            name: 'UserLoginACLUpdate',
            component: () => import('@/views/acl/UserLoginACL/UserLoginACLCreateUpdate'),
            hidden: true,
            meta: { title: i18n.t('route.UserLoginACLUpdate') }
          }
        ]
      }
    ]
  },
  {
    path: 'groups',
    component: empty,
    redirect: '',
    meta: {
      resource: 'usergroup',
      permissions: ['users.view_usergroup']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/users/Group/UserGroupList.vue'), // Parent router-view
        name: 'UserGroupList',
        meta: { title: i18n.t('route.UserGroupList'), permissions: ['users.view_usergroup'] }
      },
      {
        path: 'create',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupCreate',
        hidden: true,
        meta: {
          title: i18n.t('route.UserGroupCreate')
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'), // Parent router-view
        name: 'UserGroupUpdate',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupUpdate') }
      },
      {
        path: ':id',
        component: () => import('@/views/users/Group/UserGroupDetail'), // Parent router-view
        name: 'UserGroupDetail',
        hidden: true,
        meta: { title: i18n.t('route.UserGroupDetail') }
      }
    ]
  },
  {
    path: 'roles',
    component: empty,
    redirect: '',
    meta: {
      permissions: ['rbac.view_orgrole | rbac.view_systemrole'],
      app: 'rbac'
    },
    children: [
      {
        path: '',
        component: () => import('@/views/users/Role/RoleList/index'),
        name: 'RoleList',
        meta: {
          title: i18n.t('route.RoleList'),
          app: 'rbac',
          permissions: ['rbac.view_orgrole | rbac.view_systemrole']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/users/Role/RoleCreateUpdate'),
        name: 'RoleCreate',
        hidden: true,
        meta: {
          title: i18n.t('route.RoleCreate'),
          permissions: [],
          app: 'rbac',
          resource: 'role'
        }
      },
      {
        path: ':id/update',
        component: () => import('@/views/users/Role/RoleCreateUpdate'),
        name: 'RoleUpdate',
        hidden: true,
        meta: {
          title: i18n.t('route.RoleUpdate'),
          app: 'rbac',
          permissions: []
        }
      },
      {
        path: ':id',
        component: () => import('@/views/users/Role/RoleDetail/index'),
        name: 'RoleDetail',
        hidden: true,
        meta: {
          title: i18n.t('route.RoleDetail'),
          app: 'rbac',
          resource: 'role',
          permissions: []
        }
      }
    ]
  }
]
