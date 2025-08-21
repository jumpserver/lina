<template>
  <div>
    <DrawerListTable
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <ReportDialog :url="reportUrl" :visible.sync="visible" />
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
      showTableUpdateDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      tableConfig: {
        url: this.url,
        columns: [
          'id', 'automation', 'status', 'trigger',
          'date_start', 'date_finished', 'actions'
        ],
        columnsMeta: {
          id: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            width: '100px',
            formatterArgs: {
              route: this.detailRoute,
              getRoute: ({ row }) => ({
                name: this.detailRoute,
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
              can: ({ row }) => row.automation?.id,
              drawer: true
            },
            id: ({ row }) => row.automation,
            can: this.$hasPerm('accounts.view_' + this.resource)
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
                  can: this.$hasPerm('accounts.view_' + this.resource),
                  callback: function({ row }) {
                    vm.visible = true
                    const url = this.url.split('?')[0]
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
    const defaultExtraActions = this.tableConfig.columnsMeta.actions.formatterArgs.extraActions

    if (this.customActions) {
      this.tableConfig.columnsMeta.actions.formatterArgs.extraActions = [
        ...defaultExtraActions,
        this.customActions
      ]
    }
  },
  methods: {
    handleDetailCallback(row) {
      this.$route.params.id = row.id
      this.showTableUpdateDrawer = true
    }
  }
}
</script>
