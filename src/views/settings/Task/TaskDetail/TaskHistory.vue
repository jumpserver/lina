<template>
  <ListTable ref="list" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import { DrawerListTable as ListTable } from '@/components'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'TaskHistory',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/ops/task-executions/?task_id=${this.object.id}`,
        columns: [
          'id', 'is_finished', 'is_success', 'time_cost', 'date_start',
          'date_published', 'date_finished', 'actions'
        ],
        columnsShow: {
          default: ['id', 'is_finished', 'is_success', 'time_cost', 'date_start', 'actions']
        },
        columnsMeta: {
          is_finished: {
            label: this.$t('IsFinished'),
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
            label: this.$t('IsSuccess'),
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
            label: this.$t('Time'),
            width: '100px',
            formatter: function(row) {
              if (row.time_cost) {
                return row.time_cost.toFixed(2) + 's'
              }
              return '-'
            }
          },
          actions: {
            width: '150px',
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('Output'),
                  callback: function({ row, tableData }) {
                    openTaskPage(row.id)
                  }
                },
                {
                  name: 'run',
                  title: this.$t('RunAgain'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    this.$axios.post(`/api/v1/ops/task-executions/?from=${row.id}`, {}).then(data => {
                      vm.refreshTable()
                      openTaskPage(data.task_id)
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  },
  methods: {
    refreshTable() {
      this.$refs.list.reloadTable()
    }
  }
}
</script>

<style scoped>

</style>
