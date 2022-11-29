<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import { ActionsFormatter } from '@/components/TableFormatters'
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/ops/job-executions/',
        columns: [
          'id', 'job_type', 'is_finished', 'is_success', 'time_cost', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
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
                  title: this.$t('详情'),
                  name: 'detail',
                  can: true,
                  callback: ({ row }) => {
                    // this.$router.push({name: 'JobCreate', query: {type: 'adhoc', id: row.id}})
                  }
                },
                {
                  title: this.$t('日志'),
                  name: 'detail',
                  can: true,
                  callback: ({ row }) => {
                    // this.$router.push({name: 'JobCreate', query: {type: 'adhoc', id: row.id}})
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
