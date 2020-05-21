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
      component: () => import('@/views/xpack/GatherUser'),
      name: 'GatherUser',
      meta: { title: 'GatherUser' }
    },
    {
      path: 'orgs',
      component: () => import('@/views/xpack/org/OrganizationList'),
      name: 'OrganizationList',
      meta: { title: 'OrganizationList' }
    },
    {
      path: 'orgs/create',
      component: () => import('@/views/xpack/org/OrganizationCreateUpdate'),
      name: 'OrganizationCreate',
      hidden: true,
      meta: { title: 'OrganizationCreate', activeMenu: '/xpack/orgs', action: 'create' }
    },
    {
      path: 'orgs/:id/update',
      component: () => import('@/views/xpack/org/OrganizationCreateUpdate'),
      name: 'OrganizationUpdate',
      hidden: true,
      meta: { title: 'OrganizationUpdate', activeMenu: '/xpack/orgs', action: 'update' }
    },
    {
      path: 'orgs/:id',
      component: () => import('@/views/xpack/org/OrganizationDetail/index'),
      name: 'OrganizationDetail',
      hidden: true,
      meta: { title: 'OrganizationDetail', activeMenu: '/xpack/orgs', action: 'detail' }
    }
  ]
}
