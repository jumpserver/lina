<template>
  <div>
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      default: null
    },
    query: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showLogViewer: false,
      showLogId: '',
      tableConfig: {
        url: `/api/v1/ops/job-executions/`,
        columns: [
          'material', 'date_start', 'is_finished', 'is_success', 'time_cost', 'actions'
        ],
        columnsMeta: {
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
                  name: 'showLog',
                  title: this.$t('ops.output'),
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
        hasRightActions: false,
        hasLeftActions: false
      }
    }
  }, mounted() {
    if (this.object) {
      this.tableConfig.url += `?job_id=${this.object.id}`
    }
    if (this.query) {
      this.tableConfig.url += `?type=${this.query.type}`
    }
  }
}
</script>

<style>

</style>
