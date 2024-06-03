import i18n from '@/i18n/i18n'
import empty from '@/layout/empty'

export default [
  {
    path: 'accounts',
    component: empty,
    name: 'Account',
    meta: {
      title: i18n.t('AssetAccount'),
      app: 'accounts',
      icon: 'accounts',
      permissions: ['accounts.view_account']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AssetAccountList',
        component: () => import('@/views/accounts/Account/index.vue'),
        meta: {
          title: i18n.t('AssetAccount'),
          app: 'accounts',
          permissions: ['accounts.view_account']
        }
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/Account/AccountDetail/index.vue'),
        name: 'AssetAccountDetail',
        meta: { title: i18n.t('AssetAccountDetail') },
        hidden: true
      }
    ]
  },
  {
    path: 'virtual-accounts',
    component: empty,
    meta: {
      title: i18n.t('VirtualAccount'),
      app: 'accounts',
      permissions: ['accounts.view_virtualaccount']
    },
    hidden: true,
    redirect: '/console/accounts/accounts',
    children: [
      {
        path: ':id/update',
        component: () => import('@/views/accounts/VirtualAccount/VirtualUpdate.vue'),
        name: 'VirtualAccountUpdate',
        meta: {
          title: i18n.t('VirtualAccountUpdate'),
          activeMenu: '/console/accounts/accounts',
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/VirtualAccount/VirtualDetail/index.vue'),
        name: 'VirtualAccountDetail',
        meta: {
          title: i18n.t('VirtualAccountDetail'),
          activeMenu: '/console/accounts/accounts'
        }
      }
    ]
  },
  {
    path: 'account-template',
    component: empty,
    meta: {
      title: i18n.t('AccountTemplate'),
      app: 'accounts',
      icon: 'template',
      permissions: ['accounts.view_accounttemplate']
    },
    redirect: '',
    children: [
      {
        path: '',
        name: 'AccountTemplateList',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateList'),
        meta: {
          menuTitle: i18n.t('MenuAccountTemplates'),
          title: i18n.t('AccountTemplateList'),
          permissions: ['accounts.view_accounttemplate']
        }
      },
      {
        path: 'create',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateCreate',
        meta: {
          title: i18n.t('CreateAccountTemplate'),
          action: 'create'
        },
        hidden: true
      },
      {
        path: ':id/update',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
        name: 'AccountTemplateUpdate',
        meta: {
          title: i18n.t('UpdateAccountTemplate'),
          action: 'update'
        },
        hidden: true
      },
      {
        path: ':id',
        component: () => import('@/views/accounts/AccountTemplate/AccountTemplateDetail/index.vue'),
        name: 'AccountTemplateDetail',
        meta: { title: i18n.t('AccountTemplate') },
        hidden: true
      }
    ]
  },
  {
    path: 'automations',
    component: empty,
    name: 'AccountAutomation',
    meta: {
      title: i18n.t('Automations'),
      name: 'Automations',
      icon: 'automation',
      permissions: []
    },
    children: [
      {
        path: 'account-push',
        component: empty,
        redirect: '',
        name: 'AccountPush',
        meta: {
          app: 'accounts',
          name: 'AccountPushList',
          resource: 'pushaccountautomation'
        },
        children: [
          {
            path: '',
            component: () => import('@/views/accounts/AccountPush/index.vue'),
            name: 'AccountPushList',
            meta: {
              title: i18n.t('AccountPushList'),
              menuTitle: i18n.t('AccountPushList'),
              permissions: ['accounts.view_pushaccountautomation']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
            name: 'AccountPushCreate',
            hidden: true,
            meta: {
              title: i18n.t('AccountPushCreate'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.add_pushaccountautomation']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
            name: 'AccountPushUpdate',
            hidden: true,
            meta: {
              title: i18n.t('AccountPushUpdate'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.change_pushaccountautomation']
            }
          },
          {
            path: ':id',
            component: () => import('@/views/accounts/AccountPush/AccountPushDetail/index.vue'),
            name: 'AccountPushDetail',
            hidden: true,
            meta: {
              title: i18n.t('AccountPushList'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_pushaccountautomation']
            }
          },
          {
            path: 'executions',
            component: () => import('@/views/accounts/AccountPush/AccountPushExecutionList.vue'),
            name: 'AccountPushExecutionList',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionList'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_pushaccountexecution']
            }
          },
          {
            path: 'executions/:id',
            component: () => import('@/views/accounts/AccountPush/AccountPushExecutionDetail/index.vue'),
            name: 'AccountPushExecutionDetail',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionDetail'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_pushaccountexecution']
            }
          }
        ]
      },
      {
        path: 'account-change-secret',
        component: empty,
        name: 'AccountChangeSecret',
        meta: {
          title: i18n.t('AccountChangeSecret'),
          app: 'accounts',
          licenseRequired: true
        },
        children: [
          {
            path: '',
            component: () => import('@/views/accounts/AccountChangeSecret/index.vue'),
            name: 'AccountChangeSecretList',
            meta: {
              menuTitle: i18n.t('ChangeCredentials'),
              title: i18n.t('AccountChangeSecret'),
              permissions: ['accounts.view_changesecretautomation']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
            name: 'AccountChangeSecretCreate',
            hidden: true,
            meta: {
              title: i18n.t('AssetChangeSecretCreate'),
              permissions: ['accounts.add_changesecretautomation']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
            name: 'AccountChangeSecretUpdate',
            hidden: true,
            meta: {
              title: i18n.t('AssetChangeSecretUpdate'),
              permissions: ['accounts.change_changesecretautomation']
            }
          },
          {
            path: ':id',
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/index.vue'),
            name: 'AccountChangeSecretDetail',
            hidden: true,
            meta: {
              title: i18n.t('AccountChangeSecret'),
              permissions: ['accounts.view_changesecretautomation']
            }
          },
          {
            path: 'executions',
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionList.vue'),
            name: 'AccountChangeSecretExecutionList',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionList'),
              permissions: ['accounts.view_changesecretexecution']
            }
          },
          {
            path: 'executions/:id',
            component: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretDetail/AccountChangeSecretExecution/AccountChangeSecretExecutionDetail/index.vue'),
            name: 'AccountChangeSecretExecutionDetail',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionDetail'),
              permissions: ['accounts.view_changesecretexecution']
            }
          }
        ]
      },
      {
        path: 'account-gather',
        component: empty,
        redirect: '',
        name: 'AccountGather',
        meta: {
          title: i18n.t('AccountGatherList'),
          app: 'accounts',
          // activeMenu: '/console/accounts/automations',
          licenseRequired: true
        },
        children: [
          {
            path: '',
            component: () => import('@/views/accounts/AccountGather/index.vue'),
            name: 'AccountGatherList',
            meta: {
              menuTitle: i18n.t('GatherAccounts'),
              title: i18n.t('AccountGatherTaskList'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_gatheredaccount']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
            name: 'AccountGatherTaskCreate',
            hidden: true,
            meta: {
              title: i18n.t('AccountGatherTaskCreate'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.add_gatheraccountsautomation']
            }
          },
          {
            path: ':id',
            component: () => import('@/views/accounts/AccountGather/TaskDetail/index'),
            name: 'AccountGatherTaskDetail',
            hidden: true,
            meta: {
              title: i18n.t('AccountGatherTaskDetail'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_gatheraccountsautomation']
            }
          },
          {
            path: ':id/update',
            component: () => import('@/views/accounts/AccountGather/TaskCreateUpdate'),
            name: 'AccountGatherTaskUpdate',
            hidden: true,
            meta: {
              title: i18n.t('AccountGatherTaskUpdate'),
              action: 'update',
              permissions: ['accounts.change_gatheraccountsautomation'],
              activeMenu: '/accounts/account-gather'
            }
          },
          {
            path: 'executions',
            component: () => import('@/views/accounts/AccountGather/TaskDetail/TaskExecutionList.vue'),
            name: 'AccountGatherTaskExecutionList',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionList'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_gatheraccountsexecution']
            }
          },
          {
            path: 'executions/:id',
            component: () => import('@/views/accounts/AccountGather/TaskDetail/AccountGatherExecutionDetail/index.vue'),
            name: 'AccountGatherExecutionDetail',
            hidden: true,
            meta: {
              title: i18n.t('ExecutionDetail'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_gatheraccountsexecution']
            }
          }
        ]
      },
      {
        path: 'account-backup',
        component: empty,
        name: 'AccountBackup',
        redirect: '',
        meta: {
          title: i18n.t('AccountBackup'),
          app: 'accounts',
          resource: 'accountbackupautomation',
          licenseRequired: true
        },
        children: [
          {
            path: '',
            component: () => import('@/views/accounts/AccountBackup/index.vue'),
            name: 'AccountBackupList',
            meta: {
              menuTitle: i18n.t('AccountBackup'),
              title: i18n.t('AccountBackupList'),
              // activeMenu: '/console/accounts/automations',
              permissions: ['accounts.view_accountbackupautomation']
            }
          },
          {
            path: 'create',
            component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
            name: 'AccountBackupCreate',
            meta: {
              title: i18n.t('AccountBackupCreate'),
              // activeMenu: '/console/accounts/automations',
              action: 'create'
            },
            hidden: true
          },
          {
            path: ':id/update',
            component: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
            name: 'AccountBackupUpdate',
            meta: {
              title: i18n.t('AccountBackupUpdate'),
              // activeMenu: '/console/accounts/automations',
              action: 'update'
            },
            hidden: true
          },
          {
            path: ':id',
            component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/index.vue'),
            name: 'AccountBackupDetail',
            // activeMenu: '/console/accounts/automations',
            meta: {
              title: i18n.t('AccountBackupDetail'),
              activeMenu: '/console/accounts/automations'
            },
            hidden: true
          },
          {
            path: 'executions',
            component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/AccountBackupExecution/AccountBackupExecutionList.vue'),
            name: 'AccountBackupExecutionList',
            meta: { title: i18n.t('ExecutionDetail') },
            hidden: true
          },
          {
            path: 'executions/:id',
            component: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/AccountBackupExecution/AccountBackupExecutionDetail/index.vue'),
            name: 'AccountBackupExecutionDetail',
            meta: { title: i18n.t('ExecutionDetail') },
            hidden: true
          }
        ]
      }
    ]
  }
]
