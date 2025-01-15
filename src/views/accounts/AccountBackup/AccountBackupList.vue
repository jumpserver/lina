<template>
  <GenericListTable
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { ArrayFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountBackupList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      drawerTitle: '',
      createDrawer: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountBackup/AccountBackupDetail/index.vue'),
      showTableUpdateDrawer: false,
      currentTemplate: null,
      tableConfig: {
        url: '/api/v1/accounts/account-backup-plans/',
        permissions: {
          app: 'accounts',
          resource: 'accountbackupautomation'
        },
        columns: [
          'name', 'backup_type', 'org_name', 'is_periodic',
          'periodic_display', 'executed_amount', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'backup_type', 'org_name', 'periodic_display',
            'executed_amount', 'is_active', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountBackupDetail',
              getRoute: ({ row }) => ({
                name: 'AccountBackupDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              }),
              drawer: true
            }
          },
          types: {
            formatter: ArrayFormatter
          },
          is_periodic: {
            formatterArgs: {
              showFalse: false
            }
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: vm.$hasPerm('accounts.view_accountbackupexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountBackupList',
                  query: {
                    tab: 'AccountBackupExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'AccountBackupCreate', query: { clone_from: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  order: 1,
                  name: 'execute',
                  type: 'primary',
                  can: this.$hasPerm('accounts.add_accountbackupexecution'),
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/account-backup-plan-executions/`,
                      {
                        automation: row.id,
                        type: row.type.value
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
