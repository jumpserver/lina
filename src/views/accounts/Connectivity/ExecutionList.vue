<template>
  <div>
    <DrawerListTable
      :key="url"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :drawer-props="{ connectivityType: drawerType }"
      reload-order-query="-date_start,-id"
    />
    <ReportDialog v-model:visible="reportVisible" :url="reportUrl" />
  </div>
</template>

<script>
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import TaskStatusChoicesFormatter from '@/components/Table/TableFormatters/TaskStatusFormatter.vue'
import ReportDialog from '@/components/Dialog/ReportDialog.vue'
import { openTaskPage } from '@/utils/jms'
import { getConnectivityConfigForRow } from './config'

export default {
  name: 'ConnectivityExecutionList',
  components: { DrawerListTable, ReportDialog },
  props: {
    automationId: { type: String, default: '' }
  },
  data() {
    return {
      drawerType: '',
      reportVisible: false,
      reportUrl: '',
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        searchConfig: { getUrlQuery: false }
      }
    }
  },
  computed: {
    url() {
      const url = '/api/v1/accounts/connectivity-executions/'
      return this.automationId
        ? `${url}?automation_id=${encodeURIComponent(this.automationId)}`
        : url
    },
    tableConfig() {
      const configForRow = getConnectivityConfigForRow
      const beforeClick = ({ row }) => {
        this.drawerType = configForRow(row).type
      }
      const taskName = ({ row }) => row.automation?.name || row.snapshot?.name || '-'
      return {
        name: 'ConnectivityExecutions',
        url: this.url,
        columns: [
          'id',
          'automation',
          'type',
          'status',
          'trigger',
          'date_start',
          'duration',
          'actions'
        ],
        columnsMeta: {
          id: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: ({ row }) => this.$hasPerm(configForRow(row).viewExecutionPermission),
              getRoute: ({ row }) => ({
                name: configForRow(row).executionDetailRoute,
                params: { id: row.id }
              }),
              beforeClick,
              drawer: true
            }
          },
          automation: {
            label: this.$t('Task'),
            minWidth: '180px',
            formatter: DetailFormatter,
            formatterArgs: {
              can: ({ row }) =>
                row.automation?.id && this.$hasPerm(configForRow(row).viewPermission),
              getTitle: taskName,
              getDrawerTitle: taskName,
              getRoute: ({ row }) => ({
                name: configForRow(row).detailRoute,
                params: { id: row.automation.id }
              }),
              beforeClick,
              drawer: true
            }
          },
          type: {
            label: this.$t('Type'),
            formatter: (row) => this.$t(configForRow(row).type === 'account' ? 'Account' : 'Asset')
          },
          status: {
            label: this.$t('Status'),
            formatter: TaskStatusChoicesFormatter
          },
          trigger: { width: '135px' },
          date_start: { width: null },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'log',
                  type: 'primary',
                  title: this.$t('Log'),
                  icon: 'fa-terminal',
                  can: ({ row }) => this.$hasPerm(configForRow(row).viewExecutionPermission),
                  callback: ({ row }) => openTaskPage(row.id)
                },
                {
                  name: 'report',
                  type: 'success',
                  title: this.$t('Report'),
                  can: ({ row }) => this.$hasPerm(configForRow(row).viewExecutionPermission),
                  callback: ({ row }) => {
                    this.reportUrl = `${configForRow(row).executionUrl}${row.id}/report/`
                    this.reportVisible = true
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>
