export default {
  path: '/Xpack',
  component: () => import('@/views/jobcenter/CeleryTaskLog'),
  redirect: '/applications/remote-apps/',
  name: 'Xpack',
  meta: { title: 'Xpack', icon: 'th' }
}

