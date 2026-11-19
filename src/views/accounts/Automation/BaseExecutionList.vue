<template>
  <div>
    <DrawerListTable
      :header-actions="headerActions"
      :table-config="tableConfig"
      :drawer-props="drawerProps"
    />
    <ReportDialog v-model:visible="visible" :url="reportUrl" />
  </div>
</template>

<script>
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'

import { openTaskPage } from '@/utils/jms/index'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { taskStatusFormatterMeta } from '@/components/const'
import TaskStatusChoicesFormatter from '@/components/Table/TableFormatters/TaskStatusFormatter.vue'
import ReportDialog from '@/components/Dialog/ReportDialog.vue'

export default {
  name: 'AccountDiscoverTaskExecutionList',
  components: {
    ReportDialog,
    DrawerListTable
  },
  props: {
    url: {
      type: String,
      required: true
    },
    detailRoute: {
      type: String,
      required: true
    },
    automationRoute: {
      type: String,
      required: true
    },
    resource: {
      type: String,
      required: true
    },
    permissionApp: {
      type: String,
      default: 'accounts'
    },
    automationResource: {
      type: String,
      default: ''
    },
    columns: {
      type: Array,
      default: null
    },
    drawerProps: {
      type: Object,
      default: () => ({})
    },
    customActions: {
      type: Object,
      default: null
    }
  },
  data() {
    const vm = this
    return {
      visible: false,
      reportUrl: '',
      tableConfig: {
        url: this.url,
        permissions: { app: this.permissionApp, resource: this.resource },
        ...(this.columns ? { columns: this.columns } : {}),
        columnsMeta: {
          id: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: this.detailRoute,
              getRoute: ({ row }) => ({
                name: this.detailRoute,
                params: { id: row.id }
              }),
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
            label: this.$t('Task'),
            formatter: DetailFormatter,
            minWidth: '180px',
            formatterArgs: {
              getTitle: ({ row }) => row.automation?.name || row.snapshot.name,
              getDrawerTitle: ({ row }) => row.automation?.name || row.snapshot.name,
              getRoute: ({ row }) => ({
                name: this.automationRoute,
                params: { id: row.automation.id }
              }),
              can: ({ row }) =>
                row.automation?.id &&
                this.$hasPerm(
                  `${this.permissionApp}.view_${this.automationResource || this.resource}`
                ),
              drawer: true
            },
            id: ({ row }) => row.automation,
            can: this.$hasPerm(
              `${this.permissionApp}.view_${this.automationResource || this.resource}`
            )
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
                  icon: 'fa-terminal',
                  callback: function ({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm(`${this.permissionApp}.view_${this.resource}`),
                  callback: function ({ row }) {
                    vm.visible = true
                    const url = vm.url.split('?')[0]
                    vm.reportUrl = `${url}${row.id}/report/`
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        searchConfig: {
          getUrlQuery: true
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
    const defaultExtraActions = this.tableConfig.columnsMeta.actions.formatterArgs.extraActions

    if (this.customActions) {
      this.tableConfig.columnsMeta.actions.formatterArgs.extraActions = [
        ...defaultExtraActions,
        this.customActions
      ]
    }
  }
}
</script>
