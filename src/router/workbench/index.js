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
        icon: 'assets',
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
      path: '/workbench/file-manager',
      name: 'FileManager',
      component: empty,
      meta: {
        title: i18n.t('route.FileManager'),
        icon: 'file',
        permissions: ['rbac.view_filemanager']
      },
      children: [
        {
          path: 'bulk-Transfer',
          name: 'BulkTransfer',
          component: () => import('@/views/ops/File/index'),
          meta: {
            title: i18n.t('route.BulkTransfer'),
            permissions: ['rbac.view_filemanager']
          }
        },
        {
          path: `${BASE_URL}/koko/elfinder/sftp/`,
          name: '',
          meta: {
            title: i18n.t('route.FileManager'),
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
        permissions: [],
        hidden: () => {
          return !store.getters.publicSettings['SECURITY_COMMAND_EXECUTION']
        }
      },
      children: [
        {
          path: 'quick-job',
          name: 'QuickJob',
          component: () => import('@/views/ops/Job/QuickJob'),
          meta: {
            title: i18n.t('ops.QuickJob'),
            permissions: ['ops.view_job', 'ops.add_job', 'ops.add_jobexecution']
          }
        },
        {
          path: 'job',
          name: 'Job',
          component: empty,
          redirect: '',
          meta: {
            title: i18n.t('route.JobList'),
            permissions: ['ops.view_job']
          },
          children: [
            {
              path: '',
              name: 'JobList',
              component: () => import('@/views/ops/Job'),
              meta: {
                title: i18n.t('route.JobList'),
                permissions: ['ops.view_job']
              }
            },
            {
              path: 'create',
              component: () => import('@/views/ops/Job/JobUpdateCreate'),
              name: 'JobCreate',
              hidden: true,
              meta: {
                title: i18n.t('route.JobCreate'),
                permissions: ['ops.add_job'],
                activeMenu: '/workbench/ops/job'
              }
            },
            {
              path: ':id/update',
              component: () => import('@/views/ops/Job/JobUpdateCreate'),
              name: 'JobUpdate',
              hidden: true,
              meta: {
                title: i18n.t('route.JobUpdate'),
                permissions: ['ops.change_job'],
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
                permissions: ['ops.view_job'],
                activeMenu: '/workbench/ops/job'
              }
            }
          ]
        },
        {
          path: 'templates',
          name: 'Template',
          component: () => import('@/views/ops/Template'),
          meta: {
            title: i18n.t('route.Template'),
            permissions: ['ops.view_adhoc|ops.view_playbook']
          }
        },
        {
          path: 'executions',
          name: 'Execution',
          component: () => import('@/views/ops/Execution'),
          meta: {
            title: i18n.t('route.Execution'),
            permissions: ['ops.view_jobexecution']
          }
        },
        {
          path: 'executions/:id',
          component: () => import('@/views/ops/Execution/ExecutionDetail'),
          name: 'ExecutionDetail',
          hidden: true,
          meta: {
            title: i18n.t('ops.ExecutionDetail'),
            permissions: ['ops.view_jobexecution'],
            activeMenu: '/workbench/ops/executions'
          }
        },
        {
          path: 'adhoc/:id/update',
          name: 'AdhocUpdate',
          component: () => import('@/views/ops/Template/Adhoc/AdhocUpdateCreate'),
          hidden: true,
          meta: {
            title: i18n.t('ops.AdhocUpdate'),
            permissions: ['ops.change_adhoc'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'adhoc/create',
          name: 'AdhocCreate',
          hidden: true,
          component: () => import('@/views/ops/Template/Adhoc/AdhocUpdateCreate'),
          meta: {
            title: i18n.t('ops.createAdhoc'),
            permissions: ['ops.add_adhoc'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'adhoc/:id',
          component: () => import('@/views/ops/Template/Adhoc/AdhocDetail'),
          name: 'AdhocDetail',
          hidden: true,
          meta: {
            title: i18n.t('route.AdhocDetail'),
            permissions: ['ops.view_adhoc'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'playbook/create',
          name: 'PlaybookCreate',
          hidden: true,
          component: () => import('@/views/ops/Template/Playbook/PlaybookCreateUpdate'),
          meta: {
            title: i18n.t('ops.CreatePlaybook'),
            permissions: ['ops.add_playbook'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'playbook/:id/update',
          name: 'PlaybookUpdate',
          hidden: true,
          component: () => import('@/views/ops/Template/Playbook/PlaybookCreateUpdate'),
          meta: {
            title: i18n.t('ops.PlaybookUpdate'),
            permissions: ['ops.change_playbook'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'playbook/:id',
          component: () => import('@/views/ops/Template/Playbook/PlaybookDetail'),
          name: 'PlaybookDetail',
          hidden: true,
          meta: {
            title: i18n.t('ops.PlaybookDetail'),
            permissions: ['ops.view_playbook'],
            activeMenu: '/workbench/ops/templates'
          }
        }
      ]
    },
    {
      path: '/workbench/system-tools',
      name: 'SystemTools',
      component: () => import('@/views/settings/Tool'),
      meta: {
        title: i18n.t('setting.SystemTools'),
        icon: 'tools',
        permissions: ['rbac.view_systemtools']
      }
    }
  ]
}
