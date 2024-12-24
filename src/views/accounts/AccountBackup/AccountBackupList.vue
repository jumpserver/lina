<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
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
              })
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
              onUpdate: ({ row }) => {
                this.$route.params.id = row.id

                // 解决表单详情中的跳转
                this.$route.query.type = 'pam'

                this.currentTemplate = 'AccountBackupUpdate'
                this.drawerTitle = this.$t('AccountBackupUpdate')
                this.showTableUpdateDrawer = true
              },
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  type: 'info',
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
        hasImport: false,
        createRoute: () => {
          return {
            name: 'AccountBackupCreate'
          }
        },
        onCreate: () => {
          this.currentTemplate = 'AccountBackupCreate'
          this.drawerTitle = this.$t('AccountBackupCreate')
          this.showTableUpdateDrawer = true
        }
      }
    }
  }
}
</script>
