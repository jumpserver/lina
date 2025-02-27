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
    title: i18n.t('Workbench'),
    type: 'view',
    view: 'workbench',
    icon: 'workbench',
    showNavSwitcher: () => {
      return store.getters.workbenchOrgs.length > 0
    },
    showOrganization: true,
    permissions: ['rbac.view_workbench']
  },
  children: [
    // 404 page must be placed at the end !!!
    {
      path: '/workbench/home',
      name: 'MyHome',
      component: () => import('@/views/workbench/myhome'),
      meta: {
        icon: 'overview',
        title: i18n.t('Overview'),
        permissions: []
      }
    },
    {
      path: '/workbench/assets',
      name: 'MyAssets',
      component: empty,
      redirect: {
        name: 'ConnectAssets'
      },
      meta: {
        title: i18n.t('MyAssets'),
        permissions: ['perms.view_myassets']
      },
      children: [
        {
          path: '',
          name: 'ConnectAssets',
          component: () => import('@/views/workbench/myassets'),
          meta: {
            icon: 'assets',
            title: i18n.t('ConnectAssets'),
            permissions: ['perms.view_myassets']
          }
        },
        {
          path: 'file-transfer',
          name: 'FileTransfer',
          component: () => import('@/views/ops/File/index'),
          meta: {
            title: i18n.t('FileTransfer'),
            icon: 'file-transfer',
            permissions: ['rbac.view_filemanager']
          }
        },
        {
          path: `${BASE_URL}/koko/elfinder/sftp/`,
          name: '',
          meta: {
            title: i18n.t('FileExplorer'),
            activeMenu: '/assets',
            icon: 'fa-external-link',
            external: true,
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
        title: i18n.t('JobCenter'),
        icon: 'task-center',
        permissions: [],
        hidden: () => {
          return !store.getters.publicSettings['SECURITY_COMMAND_EXECUTION']
        }
      },
      children: [
        {
          path: 'adhoc',
          name: 'QuickAdhoc',
          component: () => import('@/views/ops/Adhoc/QuickJob'),
          meta: {
            title: i18n.t('QuickJob'),
            icon: 'adhoc',
            permissions: ['ops.view_job', 'ops.add_job', 'ops.add_jobexecution']
          }
        },
        {
          path: 'job',
          name: 'Job',
          component: empty,
          redirect: {
            name: 'JobManagement'
          },
          meta: {
            title: i18n.t('BaseJobManagement'),
            icon: 'task',
            permissions: ['ops.view_job']
          },
          children: [
            {
              path: '',
              name: 'JobManagement',
              component: () => import('@/views/ops/Job'),
              meta: {
                title: i18n.t('JobManagement'),
                permissions: ['ops.view_job']
              }
            },
            {
              path: 'create',
              component: () => import('@/views/ops/Job/JobUpdateCreate'),
              name: 'JobCreate',
              hidden: true,
              meta: {
                title: i18n.t('JobCreate'),
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
                title: i18n.t('JobUpdate'),
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
                title: i18n.t('JobDetail'),
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
            title: i18n.t('TemplateManagement'),
            icon: 'template',
            permissions: ['ops.view_adhoc|ops.view_playbook']
          }
        },
        {
          path: 'executions',
          name: 'Execution',
          component: () => import('@/views/ops/Execution'),
          meta: {
            title: i18n.t('ExecutionHistory'),
            icon: 'history',
            permissions: ['ops.view_jobexecution']
          }
        },
        {
          path: 'executions/:id',
          component: () => import('@/views/ops/Execution/ExecutionDetail'),
          name: 'ExecutionDetail',
          hidden: true,
          meta: {
            title: i18n.t('ExecutionDetail'),
            permissions: ['ops.view_jobexecution'],
            activeMenu: '/workbench/ops/executions'
          }
        },
        {
          path: 'command/:id/update',
          name: 'AdhocUpdate',
          component: () => import('@/views/ops/Template/Adhoc/AdhocUpdateCreate'),
          hidden: true,
          meta: {
            title: i18n.t('AdhocUpdate'),
            permissions: ['ops.change_adhoc'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'command/create',
          name: 'AdhocCreate',
          hidden: true,
          component: () => import('@/views/ops/Template/Adhoc/AdhocUpdateCreate'),
          meta: {
            title: i18n.t('AdhocUpdate'),
            permissions: ['ops.add_adhoc'],
            activeMenu: '/workbench/ops/templates'
          }
        },
        {
          path: 'command/:id',
          component: () => import('@/views/ops/Template/Adhoc/AdhocDetail'),
          name: 'AdhocDetail',
          hidden: true,
          meta: {
            title: i18n.t('AdhocDetail'),
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
            title: i18n.t('CreatePlaybook'),
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
            title: i18n.t('PlaybookUpdate'),
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
            title: i18n.t('PlaybookDetail'),
            permissions: ['ops.view_playbook'],
            activeMenu: '/workbench/ops/templates'
          }
        }
      ]
    },
    {
      path: '/workbench/system-tools',
      component: empty,
      name: 'More',
      alwaysShow: true,
      meta: {
        title: i18n.t('MenuMore'),
        icon: 'more',
        permissions: [],
        hidden: () => {
          return !store.getters.publicSettings['TOOL_USER_ENABLED']
        }
      },
      children: [
        {
          path: '',
          name: 'SystemTools',
          component: () => import('@/views/settings/Tool'),
          meta: {
            title: i18n.t('SystemTools'),
            icon: 'tools',
            permissions: ['rbac.view_systemtools']
          }
        }
      ]
    }
  ]
}
