import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import rolec from '@/utils/role'
import { BASE_URL } from '@/utils/common'
import empty from '@/layout/empty'

export default {
  path: '/user/',
  component: empty,
  redirect: 'assets',
  meta: {
    view: 'user',
    roles: [rolec.USER],
    permissions: [rolec.PERM_USE]
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: '/user/assets',
      component: Layout,
      meta: {
        roles: [rolec.USER],
        permissions: [rolec.PERM_USE]
      },
      children: [
        {
          path: '',
          name: 'MyAssets',
          component: () => import('@/views/userviews/assets'),
          meta: {
            title: i18n.t('route.MyAssets'),
            icon: 'files-o',
            permissions: [rolec.PERM_USE]
          }
        }
      ]
    },
    {
      path: '/user/apps',
      name: 'Apps',
      component: Layout,
      redirect: 'remoteapp',
      alwaysShow: true,
      meta: { title: i18n.t('route.MyApps'), icon: 'th', permissions: [rolec.PERM_USE] },
      children: [
        {
          path: 'remote-apps',
          name: 'MyRemoteApps',
          component: () => import('@/views/userviews/apps/RemoteApp'),
          meta: { title: i18n.t('route.RemoteApp'), permissions: [rolec.PERM_USE], licenseRequired: true }
        },
        {
          path: 'databases',
          name: 'MyDatabases',
          component: () => import('@/views/userviews/apps/DatabaseApp'),
          meta: { title: i18n.t('route.DatabaseApp'), permissions: [rolec.PERM_USE] }
        },
        {
          path: 'kubernetes',
          name: 'MyKubernetes',
          component: () => import('@/views/userviews/apps/KubernetesApp'),
          meta: { title: i18n.t('route.KubernetesApp'), permissions: [rolec.PERM_USE] }
        }
      ]
    },
    {
      path: '/user/ops',
      component: Layout,
      meta: {
        permissions: [rolec.PERM_USE],
        hidden: ({ settings }) => !settings.SECURITY_COMMAND_EXECUTION
      },
      children: [
        {
          path: '',
          name: 'CommandExecutions',
          component: () => import('@/views/ops/CommandExecution'),
          meta: { title: i18n.t('route.BatchCommand'), icon: 'terminal', permissions: [rolec.PERM_USE] }
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
          path: `${BASE_URL}/luna/`,
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
          path: `${BASE_URL}/koko/elfinder/sftp/`,
          meta: { title: i18n.t('route.FileManager'), icon: 'file', activeMenu: '/assets', permissions: [rolec.PERM_USE] }
        }
      ]
    }
  ]
}
