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
import { taskStatusFormatterMeta } from '@/components/const'
import TaskStatusChoicesFormatter from '@/components/Table/TableFormatters/TaskStatusFormatter.vue'
import ReportDialog from '@/components/Dialog/ReportDialog.vue'

export default {
  name: 'AccountDiscoverTaskExecutionList',
  components: {
    ReportDialog,
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
    const vm = this
    return {
      visible: false,
      reportUrl: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      tableConfig: {
        url: '/api/v1/accounts/gather-account-executions/',
        columns: [
          'id', 'automation', 'status', 'trigger',
          'date_start', 'date_finished', 'actions'
        ],
        columnsMeta: {
          id: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountDiscoverExecutionDetail',
              getRoute: ({ row }) => ({
                name: 'AccountDiscoverExecutionDetail',
                params: { id: row.id }
              }),
              getTitle: ({ row }) => row.id.slice(0, 8),
              drawer: true
            }
          },
          status: {
            label: this.$t('Status'),
            formatter: TaskStatusChoicesFormatter,
            ...taskStatusFormatterMeta
          },
          trigger: {
            width: '135px'
          },
          automation: {
            label: this.$t('Automation'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.automation.name,
              getRoute: ({ row }) => ({
                name: 'AccountDiscoverTaskDetail',
                params: { id: row.automation.id }
              }),
              drawer: true
            },
            id: ({ row }) => row.automation,
            can: this.$hasPerm('accounts.view_gatheraccountsexecution')
          },
          date_start: {
            width: null
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
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm('accounts.view_gatheraccountsexecution'),
                  callback: function({ row }) {
                    vm.visible = true
                    vm.reportUrl = `/api/v1/accounts/gather-account-executions/${row.id}/report/`
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
  },
  methods: {
    handleDetailCallback(row) {
      this.$route.params.id = row.id

      this.$route.query.type = 'pam'

      this.currentTemplate = 'AccountDiscoverExecutionDetail'
      this.showTableUpdateDrawer = true
    }
  }
}
</script>
