<template>
  <div>
    <ExecutionDetailDialog v-if="showExecutionDetailDialog" :item="item" :visible.sync="showExecutionDetailDialog" />
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import { ActionsFormatter } from '@/components/TableFormatters'
import { GenericListPage } from '@/layout/components'
import { openTaskPage } from '@/utils/jms'
import ExecutionDetailDialog from '@/views/ops/Executions/ExecutionDetail'

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
        hasSelection: false,
        columns: [
          'id', 'job_type', 'material', 'is_finished', 'is_success', 'time_cost', 'date_created', 'actions'
        ],
        columnsMeta: {
          count: {
            width: '96px',
            formatter: (row) => {
              if (row.count) {
                return <div>
                  <el-tooltip content='success'><span Class='text-success'>{row.count.ok}&nbsp;</span></el-tooltip>
                  <el-tooltip content='failed'><span Class='text-danger'>&nbsp;{row.count.failed}&nbsp;</span>
                  </el-tooltip>
                  <el-tooltip content='exclude'><span Class='text-warning'>&nbsp;{row.count.excludes}&nbsp;</span>
                  </el-tooltip>
                  <el-tooltip content='total'><span Class='text-primary'>&nbsp;{row.count.total}</span></el-tooltip>
                </div>
              }
              return '-'
            }
          },
          job_type: {
            width: '96px'
          },
          material: {
            width: '240px'
          },
          is_finished: {
            label: this.$t('ops.isFinished'),
            width: '96px',
            formatter: (row) => {
              if (row.is_finished) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            },
            formatterArgs: {
              width: '14px'
            }
          },
          is_success: {
            label: this.$t('ops.isSuccess'),
            width: '96px',
            formatter: (row) => {
              if (!row.is_finished) {
                return <i Class='fa  fa fa-spinner fa-spin'/>
              }
              if (row.is_success) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            },
            formatterArgs: {
              width: '14px'
            }
          },
          time_cost: {
            label: this.$t('ops.time'),
            width: '100px',
            formatter: function(row) {
              if (row.time_cost) {
                return row.time_cost.toFixed(2) + 's'
              }
              return '-'
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('common.Detail'),
                  name: 'detail',
                  type: 'primary',
                  can: true,
                  callback: ({ row }) => {
                    this.$router.push({ name: 'ExecutionDetail', params: { id: row.id }})
                  }
                },
                {
                  title: this.$t('ops.output'),
                  name: 'logging',
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
        hasCreate: false,
        canCreate: false,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        onCreate: () => {
          this.uploadDialogVisible = true
        }
      }
    }
  }
}
</script>

<style>

</style>
