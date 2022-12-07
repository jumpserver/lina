<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import { ActionsFormatter } from '@/components/TableFormatters'
import { GenericListPage } from '@/layout/components'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/ops/job-executions/',
        hasSelection: false,
        columns: [
          'id', 'job_type', 'is_finished', 'is_success', 'time_cost', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          job_type: {
            width: '96px'
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
                  can: true,
                  callback: ({ row }) => {
                    console.log(1)
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
