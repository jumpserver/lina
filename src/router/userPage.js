import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'

const scheme = document.location.protocol
const port = document.location.port ? ':' + document.location.port : ''
const URL = scheme + '//' + document.location.hostname + port

export default [
  // 404 page must be placed at the end !!!
  {
    path: '/',
    component: Layout,
    redirect: '/assets',
    children: [
      {
        path: 'assets',
        name: 'assets',
        component: () => import('@/userviews/assets/index'),
        meta: { title: i18n.t('route.MyAssets'), icon: 'files-o' }
      }
    ]
  },
  {
    path: '/apps',
    component: Layout,
    redirect: '/apps/remoteapp',
    meta: { title: i18n.t('route.MyApps'), icon: 'th' },
    children: [
      {
        path: '/apps/remoteapp',
        name: 'remoteapp',
        component: () => import('@/userviews/apps/RemoteApp'),
        meta: { title: i18n.t('route.RemoteApp') }
      },
      {
        path: '/apps/database',
        name: 'assets',
        component: () => import('@/userviews/apps/DatabaseApp'),
        meta: { title: i18n.t('route.DatabaseApp') }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    children: [
      {
        path: '/users/profile',
        name: 'profile',
        component: () => import('@/userviews/users/index'),
        meta: { title: i18n.t('route.UserProfile'), icon: 'user' }
      }
    ]
  },
  {
    path: '/command-executions',
    component: Layout,
    children: [
      {
        path: '',
        name: 'CommandExecutions',
        component: () => import('@/views/ops/CommandExecution'),
        meta: { title: i18n.t('route.CommandExecutions'), icon: 'terminal' }
      }
    ]
  },
  {
    path: `external-luna`,
    component: Layout,
    children: [
      {
        path: `${URL}/luna/`,
        meta: { title: i18n.t('route.WebTerminal'), icon: 'window-maximize', activeMenu: '/assets' }
      }
    ]
  },
  {
    path: 'external-elfinder',
    component: Layout,
    children: [
      {
        path: `${URL}/koko/elfinder/sftp/`,
        meta: { title: i18n.t('route.WebFTP'), icon: 'file', activeMenu: '/assets' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
