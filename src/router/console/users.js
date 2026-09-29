import empty from '@/layout/empty'
import { createViewSetRoutes } from '../viewset'

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
    children: createViewSetRoutes({
      name: 'User',
      list: () => import('@/views/users/User/UserList.vue'),
      form: () => import('@/views/users/User/UserCreateUpdate.vue'),
      detail: () => import('@/views/users/User/UserDetail')
    })
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
    children: createViewSetRoutes({
      name: 'UserGroup',
      list: () => import('@/views/users/Group/UserGroupList.vue'),
      form: () => import('@/views/users/Group/UserGroupCreateUpdate.vue'),
      detail: () => import('@/views/users/Group/UserGroupDetail'),
      meta: { list: { permissions: ['users.view_usergroup'] } }
    })
  }
]
