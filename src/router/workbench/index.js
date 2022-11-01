import Layout from '@/layout'
import i18n from '@/i18n/i18n'
import { BASE_URL } from '@/utils/common'
import empty from '@/layout/empty'
import store from '@/store'

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
    showNavSwitcher: () => {
      return store.getters.workbenchOrgs.length > 0
    },
    showOrganization: true,
    permissions: []
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
    },
    {
      path: '/workbench/ops',
      component: empty,
      name: 'JobCenter',
      meta: {
        title: i18n.t('route.JobCenter'),
        icon: 'coffee',
        permissions: []
      },
      children: [
        {
          path: 'a',
          name: 'CommandExecutions2',
          component: () => import('@/views/ops/Command'),
          meta: {
            title: i18n.t('route.BatchCommand'),
            icon: 'terminal',
            permissions: []
          }
        },
        {
          path: '',
          name: 'CommandExecutions',
          component: () => import('@/views/ops/Command'),
          meta: {
            title: i18n.t('route.BatchScript'),
            icon: 'book',
            permissions: []
          }
        }
      ]
    }
  ]
}
