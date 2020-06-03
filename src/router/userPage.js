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
    meta: {
      roles: ['User'],
      title: i18n.t('route.MyAssets'),
      icon: 'files-o'
    },
    children: [
      {
        path: '',
        name: 'assets',
        component: () => import('@/userviews/assets/index'),
        meta: {
          title: i18n.t('route.MyAssets'),
          icon: 'files-o',
          roles: ['User']
        }
      }
    ]
  },
  {
    path: '/apps',
    name: 'Apps',
    component: Layout,
    redirect: '/apps/remoteapp',
    meta: { title: i18n.t('route.MyApps'), icon: 'th', roles: ['User'] },
    children: [
      {
        path: '/apps/remoteapp',
        name: 'remoteapp',
        component: () => import('@/userviews/apps/RemoteApp'),
        meta: { title: i18n.t('route.RemoteApp'), roles: ['User'] }
      },
      {
        path: '/apps/database',
        name: 'assets',
        component: () => import('@/userviews/apps/DatabaseApp'),
        meta: { title: i18n.t('route.DatabaseApp'), roles: ['User'] }
      }
    ]
  },
  {
    path: '/command-executions',
    component: Layout,
    meta: {
      roles: ['User']
    },
    children: [
      {
        path: '',
        name: 'CommandExecutions',
        component: () => import('@/views/ops/CommandExecution'),
        meta: { title: i18n.t('route.CommandExecutions'), icon: 'terminal', roles: ['User'] }
      }
    ]
  },
  {
    path: `external-luna`,
    component: Layout,
    meta: {
      roles: ['User']
    },
    children: [
      {
        path: `${URL}/luna/`,
        meta: { title: i18n.t('route.WebTerminal'), icon: 'window-maximize', activeMenu: '/assets', roles: ['User'] }
      }
    ]
  },
  {
    path: 'external-elfinder',
    component: Layout,
    meta: {
      roles: ['User']
    },
    children: [
      {
        path: `${URL}/koko/elfinder/sftp/`,
        meta: { title: i18n.t('route.WebFTP'), icon: 'file', activeMenu: '/assets', roles: ['User'] }
      }
    ]
  }
]
