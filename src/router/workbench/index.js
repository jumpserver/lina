import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common'
import empty from '@/layout/empty'

export default {
  path: '/workbench/',
  component: Layout,
  name: 'workbench',
  redirect: '/workbench/home',
  meta: {
    title: i18n.t('common.nav.Workbench'),
    type: 'view',
    view: 'workbench',
    icon: 'el-icon-user-solid',
    showNavSwitcher: true,
    showOrganization: true,
    permissions: ['rbac.view_workbench']
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: '/workbench/home',
      name: 'MyHome',
      component: () => import('@/views/myhome'),
      meta: {
        icon: 'area-chart',
        title: i18n.t('route.Overview'),
        permissions: []
      }
    },
    {
      path: '/workbench/assets',
      name: 'MyAssets',
      component: () => import('@/views/myassets'),
      meta: {
        icon: 'files-o',
        title: i18n.t('route.MyAssets'),
        permissions: ['perms.view_myassets']
      }
    },
    {
      path: '/workbench/apps',
      name: 'Apps',
      component: empty,
      redirect: 'remoteapp',
      alwaysShow: true,
      meta: {
        title: i18n.t('route.MyApps'),
        icon: 'th',
        permissions: ['perms.view_myapps']
      },
      children: [
        {
          path: 'remote-apps',
          name: 'MyRemoteApps',
          component: () => import('@/views/myapps/RemoteApp'),
          meta: {
            title: i18n.t('route.RemoteApp'),
            permissions: [],
            licenseRequired: true
          }
        },
        {
          path: 'databases',
          name: 'MyDatabases',
          component: () => import('@/views/myapps/DatabaseApp'),
          meta: {
            title: i18n.t('route.DatabaseApp'),
            permissions: []
          }
        },
        {
          path: 'kubernetes',
          name: 'MyKubernetes',
          component: () => import('@/views/myapps/KubernetesApp'),
          meta: {
            title: i18n.t('route.KubernetesApp'),
            permissions: []
          }
        }
      ]
    },
    {
      path: '/workbench/ops',
      component: empty,
      meta: {
        permissions: ['ops.add_commandexecution'],
        hidden: ({ settings }) => !settings['SECURITY_COMMAND_EXECUTION']
      },
      children: [
        {
          path: '',
          name: 'CommandExecutions',
          component: () => import('@/views/ops/CommandExecution'),
          meta: {
            title: i18n.t('route.BatchCommand'),
            icon: 'terminal',
            permissions: ['ops.add_commandexecution']
          }
        }
      ]
    },
    {
      path: `external-luna`,
      component: empty,
      meta: {
        permissions: ['rbac.view_webterminal']
      },
      children: [
        {
          path: `${BASE_URL}/luna/`,
          meta: {
            title: i18n.t('route.WebTerminal'),
            icon: 'window-maximize',
            activeMenu: '/assets',
            permissions: []
          }
        }
      ]
    },
    {
      path: 'external-elfinder',
      component: empty,
      meta: {
        permissions: ['rbac.view_filemanager']
      },
      children: [
        {
          path: `${BASE_URL}/koko/elfinder/sftp/`,
          meta: {
            title: i18n.t('route.FileManager'),
            icon: 'file',
            activeMenu: '/assets',
            permissions: ['rbac.view_filemanager']
          }
        }
      ]
    }
  ]
}
