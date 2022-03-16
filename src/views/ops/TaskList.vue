<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import { timeOffset, toSafeLocalDateStr } from '@/utils/common'
import { GenericListPage } from '@/layout/components'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'runtimes', 'host_amount', 'is_success',
          'date_start', 'time', 'actions'
        ],
        columnsMeta: {
          name: {
            showOverflowTooltip: true,
            formatterArgs: {
              getTitle({ row }) {
                return row['display_name']
              }
            }
          },
          runtimes: {
            label: this.$t('ops.runTimes'),
            width: '120px',
            formatter: function(row) {
              return (<div>
                <span Class='text-primary'>{row.summary.success}</span>/
                <span Class='text-danger'>{row.summary.failed}</span>/
                <span>{row.summary.total}</span>
              </div>)
            }
          },
          host_amount: {
            label: this.$t('ops.hosts'),
            width: '65px',
            formatter: function(row) {
              return _.get(row, 'latest_execution.hosts_amount', 0)
            }
          },
          is_success: {
            label: this.$t('ops.success'),
            align: 'center',
            width: '80px',
            formatter: row => {
              if (_.get(row, 'latest_execution.is_success', false)) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
            }
          },
          date_start: {
            label: this.$t('ops.date'),
            width: '150px',
            formatter: function(row) {
              if (_.get(row, 'latest_execution.date_start', false)) {
                return toSafeLocalDateStr(row.latest_execution.date_start)
              }
              return ''
            }
          },
          time: {
            label: this.$t('ops.time'),
            width: '100px',
            formatter: function(row) {
              if (_.get(row, 'latest_execution.date_start', false)) {
                return timeOffset(row.latest_execution.date_start, row.latest_execution.date_finished)
              }
              return ''
            }
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              canDelete: this.$hasPerm('ops.delete_task'),
              extraActions: [
                {
                  name: 'run',
                  can: this.$hasPerm('ops.add_adhoc'),
                  title: this.$t('ops.run'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    this.$axios.get(
                      `/api/v1/ops/tasks/${row.id}/run/`
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasCreate: false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
