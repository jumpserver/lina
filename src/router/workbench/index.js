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
    icon: 'workbench',
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
        icon: 'overview',
        title: i18n.t('route.Overview'),
        permissions: []
      }
    },
    {
      path: '/workbench/assets',
      name: 'MyAssets',
      component: () => import('@/views/myassets'),
      meta: {
        icon: 'my-asset',
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
            icon: 'web-terminal',
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
        icon: 'task-center',
        permissions: []
      },
      children: [
        {
          path: 'quick-job',
          name: 'QuickJob',
          hidden: true,
          component: () => import('@/views/ops/Job/QuickJob'),
          meta: {
            title: i18n.t('ops.QuickJob'),
            permissions: [],
            activeMenu: '/workbench/ops/job'
          }
        },
        {
          path: 'job',
          name: 'Job',
          component: empty,
          redirect: '',
          meta: {
            title: i18n.t('route.JobList'),
            permissions: []
          },
          children: [
            {
              path: '',
              name: 'JobList',
              component: () => import('@/views/ops/Job'),
              meta: {
                title: i18n.t('route.JobList'),
                permissions: []
              }
            },
            {
              path: 'create',
              component: () => import('@/views/ops/Job/JobUpdateCreate'),
              name: 'JobCreate',
              hidden: true,
              meta: {
                title: i18n.t('route.JobCreate'),
                permissions: [],
                activeMenu: '/workbench/ops/job'
              }
            },
            {
              path: 'update',
              component: () => import('@/views/ops/Job/JobUpdateCreate'),
              name: 'JobUpdate',
              hidden: true,
              meta: {
                title: i18n.t('route.JobUpdate'),
                permissions: [],
                activeMenu: '/workbench/ops/job'
              }
            },
            {
              path: ':id',
              component: () => import('@/views/ops/Job/JobDetail'),
              name: 'JobDetail',
              hidden: true,
              meta: {
                title: i18n.t('route.JobDetail'),
                permissions: [],
                activeMenu: '/workbench/ops/job'
              }
            }
          ]
        },
        {
          path: 'scripts',
          name: 'ScriptManage',
          component: () => import('@/views/ops/ScriptManage'),
          meta: {
            title: i18n.t('route.ScriptManage'),
            permissions: []
          }
        },
        {
          path: 'executions',
          name: 'Executions',
          component: () => import('@/views/ops/Executions'),
          meta: {
            title: i18n.t('route.Executions'),
            permissions: []
          }
        },
        {
          path: 'executions/:id',
          component: () => import('@/views/ops/Executions/ExecutionDetail'),
          name: 'ExecutionDetail',
          hidden: true,
          meta: {
            title: i18n.t('ops.ExecutionDetail'),
            permissions: [],
            activeMenu: '/workbench/ops/executions'
          }
        },
        {
          path: 'adhoc/:id/update',
          name: 'AdhocUpdate',
          component: () => import('@/views/ops/ScriptManage/Adhoc/AdhocUpdateCreate'),
          hidden: true,
          meta: {
            title: i18n.t('route.updateAdhoc'),
            permissions: [],
            activeMenu: '/workbench/ops/scripts'
          }
        },
        {
          path: 'adhoc/create',
          name: 'AdhocCreate',
          hidden: true,
          component: () => import('@/views/ops/ScriptManage/Adhoc/AdhocUpdateCreate'),
          meta: {
            title: i18n.t('ops.createAdhoc'),
            permissions: [],
            activeMenu: '/workbench/ops/scripts'
          }
        },
        {
          path: 'adhoc/:id',
          component: () => import('@/views/ops/ScriptManage/Adhoc/AdhocDetail'),
          name: 'AdhocDetail',
          hidden: true,
          meta: {
            title: i18n.t('route.AdhocDetail'),
            permissions: [],
            activeMenu: '/workbench/ops/scripts'
          }
        },
        {
          path: 'playbook/:id/update',
          name: 'PlaybookUpdate',
          hidden: true,
          component: () => import('@/views/ops/ScriptManage/Playbook/PlaybookUpdate'),
          meta: {
            title: i18n.t('ops.PlaybookUpdate'),
            permissions: [],
            activeMenu: '/workbench/ops/scripts'
          }
        },
        {
          path: 'playbook/:id',
          component: () => import('@/views/ops/ScriptManage/Playbook/PlaybookDetail'),
          name: 'PlaybookDetail',
          hidden: true,
          meta: {
            title: i18n.t('ops.PlaybookDetail'),
            permissions: [],
            activeMenu: '/workbench/ops/scripts'
          }
        }
      ]
    }
  ]
}
