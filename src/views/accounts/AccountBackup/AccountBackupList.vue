<template>
  <GenericListTable
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$tc('AccountBackupTask')"
    :table-config="tableConfig"
  />
</template>

<script>
import { ActionsFormatter, ArrayFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { GenericListTable } from '@/layout/components'

export default {
  name: 'AccountBackupList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/accounts/AccountBackup/AccountBackupCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountBackup/Detail/index.vue'),
      tableConfig: {
        url: '/api/v1/accounts/account-backup-plans/',
        permissions: {
          app: 'accounts',
          resource: 'backupaccountautomation'
        },
        columns: [
          'name', 'backup_type', 'org_name', 'is_periodic',
          'periodic_display', 'executed_amount', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'backup_type', 'periodic_display',
            'executed_amount', 'is_active', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountBackupDetail'
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
            formatter: (row) => {
              const can = vm.$hasPerm('accounts.view_backupaccountexecution')
              return <el-link onClick={ () => this.handleExecAmount(row) } disabled={ !can }>{ row.executed_amount }</el-link>
            }
          },
          actions: {
            formatterArgs: {
              formatter: ActionsFormatter,
              cloneRoute: 'AccountBackupCreate',
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  order: 1,
                  name: 'execute',
                  type: 'primary',
                  can: this.$hasPerm('accounts.add_backupaccountexecution'),
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
  },
  methods: {
    handleExecAmount(row) {
      this.$router.push({
        name: 'AccountBackupList',
        query: {
          tab: 'AccountBackupExecutionList',
          automation_id: row.id
        }
      })
    }
  }
}
</script>
