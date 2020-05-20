import Layout from '@/layout/index'

export default {
  path: '/xpack',
  component: Layout,
  redirect: '/applications/remote-apps/',
  name: 'Xpack',
  meta: { title: 'Xpack', icon: 'th' },
  children: [
    {
      path: 'interface-setting',
      component: () => import('@/views/xpack/InterfaceSettings.vue'),
      name: 'InterfaceSetting',
      meta: { title: 'InterfaceSetting' }
    },
    {
      path: 'license',
      component: () => import('@/views/xpack/License.vue'),
      name: 'License',
      meta: { title: 'License' }
    },
    {
      path: 'gathered-users',
      component: () => import('@/views/xpack/GatheredUser/GatheredUserList'),
      name: 'GatherUserList',
      meta: { title: 'GatherUserList' }
    },
    {
      path: 'gathered-users/tasks',
      component: () => import('@/views/xpack/GatheredUser/TaskList'),
      name: 'GatherUserTaskList',
      meta: { title: 'GatherUserTask' },
      hidden: true
    },
    {
      path: 'gathered-users/tasks/create',
      component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
      name: 'GatherUserTaskCreate',
      meta: { title: 'GatherUserTaskCreate', action: 'create' },
      hidden: true
    },
    {
      path: 'gathered-users/tasks/update',
      component: () => import('@/views/xpack/GatheredUser/TaskCreateUpdate'),
      name: 'GatherUserTaskUpdate',
      meta: { title: 'GatherUserTaskUpdate', action: 'update' },
      hidden: true
    }
  ]
}
