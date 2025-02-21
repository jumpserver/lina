<template>
  <div>
    <ExecutionDetailDialog v-if="showExecutionDetailDialog" :item="item" :visible.sync="showExecutionDetailDialog" />
    <GenericListPage ref="GenericListPage" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { openTaskPage } from '@/utils/jms'
import ExecutionDetailDialog from '@/views/ops/Execution/ExecutionDetail'
import detailFormatter from '@/components/Table/TableFormatters/DetailFormatter.vue'

export default {
  components: {
    GenericListPage,
    ExecutionDetailDialog
  },
  data() {
    return {
      item: {},
      uploadDialogVisible: false,
      showExecutionDetailDialog: false,
      tableConfig: {
        url: '/api/v1/ops/job-executions/',
        columnsExclude: [
          'summary', 'parameters', 'timedelta'
        ],
        columnsShow: {
          min: ['material', 'actions'],
          default: [
            'id', 'material', 'job_type', 'is_finished', 'is_success',
            'time_cost', 'date_created', 'actions'
          ]
        },
        columnsMeta: {
          material: {
            width: '500px'
          },
          id: {
            formatter: detailFormatter,
            formatterArgs: {
              drawer: true,
              route: 'ExecutionDetail'
            }
          },
          job: {
            formatter: (row) => {
              return <span>{row.job?.name || '-'}</span>
            }
          },
          is_finished: {
            width: '100px',
            formatter: (row) => {
              if (row.is_finished) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          },
          is_success: {
            width: '100px',
            formatter: (row) => {
              if (!row.is_finished) {
                return <i Class='fa  fa fa-spinner fa-spin'/>
              }
              if (row.is_success) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          },
          time_cost: {
            formatter: function(row) {
              if (row.time_cost) {
                return row.time_cost.toFixed(2) + 's'
              }
              return '-'
            }
          },
          actions: {
            width: '130px',
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('Output'),
                  name: 'logging',
                  type: 'info',
                  can: true,
                  callback: ({ row }) => {
                    openTaskPage(row.task_id)
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
