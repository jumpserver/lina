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
    }
  ]
}
