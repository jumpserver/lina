<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script type="text/jsx">
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import { ActionsFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = getDaysFuture(1, now).toISOString()
    return {
      tableConfig: {
        url: '/api/v1/audits/job-logs/',
        hasColumnActions: false,
        columnsShow: {
          min: ['material', 'is_success'],
          default: [
            'created_by', 'material', 'is_finished',
            'is_success', 'time_cost', 'date_start',
            'date_finished', 'actions'
          ]
        },
        columns: [
          'created_by', 'material', 'is_finished',
          'is_success', 'time_cost', 'date_start',
          'date_finished', 'actions'
        ],
        columnsMeta: {
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
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
          date_start: {
            width: '160px'
          }
        },
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false,
        searchConfig: {
          options: [
            {
              label: this.$t('audits.User'),
              value: 'user__name'
            },
            {
              label: this.$t('audits.Username'),
              value: 'user__username'
            },
            {
              label: this.$t('audits.SystemUserName'),
              value: 'run_as__username'
            }
          ]
        },
        datePicker: {
          dateStart: dateFrom,
          dateEnd: dateTo
        }
      }
    }
  }
}
</script>

<style>
</style>
