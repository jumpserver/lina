import Layout from '@/layout/index'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'

const scheme = document.location.protocol
const port = document.location.port ? ':' + document.location.port : ''
const URL = scheme + '//' + document.location.hostname + port

export default [
  // 404 page must be placed at the end !!!
  {
    path: '/',
    component: Layout,
    meta: {
      roles: [rolec.USER],
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: '',
        name: 'MyAssets',
        component: () => import('@/userviews/assets/index'),
        meta: {
          title: i18n.t('route.MyAssets'),
          icon: 'files-o',
          permissions: [rolec.PERM_USE]
        }
      }
    ]
  },
  {
    path: '/apps',
    name: 'Apps',
    component: Layout,
    redirect: '/apps/remoteapp',
    alwaysShow: true,
    meta: { title: i18n.t('route.MyApps'), icon: 'th', permissions: [rolec.PERM_USE] },
    children: [
      {
        path: '/apps/remoteapp',
        name: 'MyRemoteApps',
        component: () => import('@/userviews/apps/RemoteApp'),
        meta: { title: i18n.t('route.RemoteApp'), permissions: [rolec.PERM_USE], licenseRequired: true }
      },
      {
        path: '/apps/database',
        name: 'MyDatebases',
        component: () => import('@/userviews/apps/DatabaseApp'),
        meta: { title: i18n.t('route.DatabaseApp'), permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: '/command-executions',
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE],
      commandExecutionRequired: true
    },
    children: [
      {
        path: '',
        name: 'CommandExecutions',
        component: () => import('@/views/ops/CommandExecution'),
        meta: { title: i18n.t('route.CommandExecutions'), icon: 'terminal', permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: `external-luna`,
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: `${URL}/luna/`,
        meta: { title: i18n.t('route.WebTerminal'), icon: 'window-maximize', activeMenu: '/assets', permissions: [rolec.PERM_USE] }
      }
    ]
  },
  {
    path: 'external-elfinder',
    component: Layout,
    meta: {
      permissions: [rolec.PERM_USE]
    },
    children: [
      {
        path: `${URL}/koko/elfinder/sftp/`,
        meta: { title: i18n.t('route.WebFTP'), icon: 'file', activeMenu: '/assets', permissions: [rolec.PERM_USE] }
      }
    ]
  }
]
