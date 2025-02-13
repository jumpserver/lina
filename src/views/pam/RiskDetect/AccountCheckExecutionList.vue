<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'CheckAccountExecutionList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/check-account-executions/',
        columns: [
          'automation', 'task_name', 'asset_amount',
          'node_amount', 'status', 'trigger',
          'date_start', 'date_finished', 'actions'
        ],
        columnsShow: {
          default: [
            'automation', 'task_name', 'status',
            'date_start', 'date_finished', 'actions'
          ]
        },
        columnsMeta: {
          automation: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountCheckExecutionDetail',
              getRoute: ({ row }) => ({
                name: 'AccountCheckExecutionDetail',
                params: { id: row.id }
              }),
              drawer: true,
              can: this.$hasPerm('accounts.view_checkaccountexecution')
            }
          },
          task_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountCheckDetail',
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
                  can: this.$hasPerm('accounts.view_checkaccountexecution'),
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm('accounts.view_checkaccountexecution'),
                  callback: function({ row }) {
                    window.open(`/api/v1/accounts/check-account-executions/${row.id}/report/`)
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
        hasSearch: true,
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false
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
