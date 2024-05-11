<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script type="text/jsx">
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/audits/job-logs/',
        columnsShow: {
          min: ['material', 'is_success'],
          default: [
            'creator_name', 'material', 'job_type', 'is_finished',
            'is_success', 'time_cost', 'date_start', 'actions'
          ]
        },
        columns: [
          'creator_name', 'material', 'job_type', 'is_finished',
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
                  title: this.$t('View'),
                  name: 'logging',
                  can: true,
                  type: 'primary',
                  callback: ({ row }) => {
                    openTaskPage(row.task_id)
                  }
                }
              ]
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
          is_finished: {
            formatter: (row) => {
              if (row.is_finished) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          },
          is_success: {
            formatter: (row) => {
              if (!row.is_finished) {
                return <i Class='fa  fa fa-spinner fa-spin'/>
              }
              if (row.is_success) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false,
        searchConfig: {
          options: [
            {
              label: this.$t('User'),
              value: 'creator__name'
            }
          ]
        }
      }
    }
  }
}
</script>

<style>
</style>
