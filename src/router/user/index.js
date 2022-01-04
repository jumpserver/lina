import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common'
import empty from '@/layout/empty'

export default {
  path: '/user/',
  component: Layout,
  name: 'UserView',
  redirect: '/user/assets',
  meta: {
    title: i18n.t('common.nav.UserPage'),
    type: 'view',
    view: 'user',
    icon: 'el-icon-user-solid',
    showNavSwitcher: true,
    permissions: ['rbac.view_userview']
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: '/user/assets',
      name: 'MyAssets',
      component: () => import('@/views/userviews/assets'),
      meta: {
        icon: 'files-o',
        title: i18n.t('route.MyAssets'),
        permissions: ['perms.view_myassets']
      }
    },
    {
      path: '/user/apps',
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
          component: () => import('@/views/userviews/apps/RemoteApp'),
          meta: {
            title: i18n.t('route.RemoteApp'),
            permissions: [],
            licenseRequired: true
          }
        },
        {
          path: 'databases',
          name: 'MyDatabases',
          component: () => import('@/views/userviews/apps/DatabaseApp'),
          meta: {
            title: i18n.t('route.DatabaseApp'),
            permissions: []
          }
        },
        {
          path: 'kubernetes',
          name: 'MyKubernetes',
          component: () => import('@/views/userviews/apps/KubernetesApp'),
          meta: {
            title: i18n.t('route.KubernetesApp'),
            permissions: []
          }
        }
      ]
    },
    {
      path: '/user/ops',
      component: empty,
      meta: {
        permissions: [],
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
            permissions: []
          }
        }
      ]
    },
    {
      path: `external-luna`,
      component: empty,
      meta: {
        permissions: []
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
        permissions: []
      },
      children: [
        {
          path: `${BASE_URL}/koko/elfinder/sftp/`,
          meta: {
            title: i18n.t('route.FileManager'),
            icon: 'file',
            activeMenu: '/assets',
            permissions: []
          }
        }
      ]
    }
  ]
}
