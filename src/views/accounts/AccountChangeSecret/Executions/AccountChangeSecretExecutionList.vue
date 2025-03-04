<template>
  <div>
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
    <ReportDialog :visible.sync="visible" :url="reportUrl" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import ReportDialog from '@/components/Dialog/ReportDialog.vue'

export default {
  name: 'AccountChangeSecretExecutionList',
  components: {
    ReportDialog,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      visible: false,
      reportUrl: '',
      tableConfig: {
        url: '/api/v1/accounts/change-secret-executions',
        columns: [
          'automation', 'change_secret_name', 'asset_amount', 'node_amount', 'status',
          'trigger', 'date_start', 'date_finished', 'actions'
        ],
        columnsShow: {
          default: [
            'automation', 'change_secret_name', 'trigger', 'status',
            'date_start', 'date_finished', 'actions'
          ]
        },
        columnsMeta: {
          automation: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretExecutionDetail',
              getRoute: ({ row }) => ({
                name: 'AccountChangeSecretExecutionDetail',
                params: { id: row.id }
              }),
              getTitle: ({ row }) => row.id.slice(0, 8),
              drawer: true,
              can: this.$hasPerm('accounts.view_changesecretexecution')
            }
          },
          change_secret_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getDrawerTitle({ row }) {
                return row.snapshot.name
              },
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountChangeSecretDetail',
                params: { id: row.automation }
              })
            },
            id: ({ row }) => row.automation
          },
          asset_amount: {
            label: this.$t('AssetsOfNumber'),
            formatter: function(row) {
              return <span>{row.snapshot.asset_amount}</span>
            }
          },
          node_amount: {
            label: this.$t('NodeOfNumber'),
            formatter: function(row) {
              return <span>{row.snapshot.node_amount}</span>
            }
          },
          status: {
            label: this.$t('Result')
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'log',
                  type: 'primary',
                  can: this.$hasPerm('accounts.view_changesecretexecution'),
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm('accounts.view_changesecretexecution'),
                  callback: function({ row }) {
                    vm.visible = true
                    vm.reportUrl = `/api/v1/accounts/change-secret-executions/${row.id}/report/`
                  }
                },
                {
                  name: 'record',
                  title: this.$t('Record'),
                  can: this.$hasPerm('accounts.view_changesecretrecord'),
                  callback: function({ row }) {
                    return this.$router.push({
                      name: 'AccountChangeSecretList',
                      query: {
                        tab: 'ChangeSecretRecord',
                        execution_id: row.id
                      }
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        searchConfig: {
          options: [
            {
              label: this.$t('TaskID'),
              value: 'automation_id'
            },
            {
              label: this.$t('DisplayName'),
              value: 'automation__name'
            }
          ]
        },
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false
      }
    }
  },
  mounted() {
    const automation_id = this.$route.query.automation_id
    if (automation_id !== undefined) {
      this.tableConfig.url = `${this.tableConfig.url}?automation_id=${automation_id}`
    }
  }
}
</script>
