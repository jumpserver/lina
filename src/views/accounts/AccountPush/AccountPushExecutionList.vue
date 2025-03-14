<template>
  <div>
    <GenericListTable
      ref="listTable"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <ReportDialog :url="reportUrl" :visible.sync="visible" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import ReportDialog from '@/components/Dialog/ReportDialog'

export default {
  name: 'AccountPushExecutionList',
  components: {
    GenericListTable,
    ReportDialog
  },
  data() {
    const vm = this
    return {
      visible: false,
      reportUrl: '',
      detailDrawer: () => import('@/views/accounts/AccountPush/ExecutionDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/accounts/push-account-executions/',
        columns: [
          'automation', 'push_user_name', 'asset_amount', 'node_amount', 'status',
          'trigger', 'date_start', 'date_finished', 'actions'
        ],
        columnsShow: {
          default: [
            'automation', 'push_user_name', 'trigger', 'status',
            'date_start', 'date_finished', 'actions'
          ]
        },
        columnsMeta: {
          automation: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountPushExecutionDetail',
              getRoute: ({ row }) => ({
                name: 'AccountPushExecutionDetail',
                params: { id: row.id }
              }),
              getTitle: ({ row }) => row.id.slice(0, 8),
              drawer: true,
              can: this.$hasPerm('accounts.view_pushaccountexecution')
            }
          },
          push_user_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getTitle: ({ row }) => row.automation.name,
              getRoute: ({ row }) => ({
                name: 'AccountPushDetail',
                params: { id: row.automation.id }
              }),
              getDrawerTitle({ row }) {
                return row.automation.name
              }
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
                  can: this.$hasPerm('accounts.view_pushaccountexecution'),
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  can: this.$hasPerm('accounts.view_pushaccountexecution'),
                  callback: function({ row }) {
                    vm.visible = true
                    vm.reportUrl = `/api/v1/accounts/push-account-executions/${row.id}/report/`
                  }
                },
                {
                  name: 'record',
                  title: this.$t('Record'),
                  can: this.$hasPerm('accounts.view_pushsecretrecord'),
                  callback: function({ row }) {
                    return this.$router.push({
                      name: 'AccountPushList',
                      query: {
                        tab: 'AccountPushRecord',
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
          getUrlQuery: true,
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
