<template>
  <ListTable ref="list" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import ListTable from '@/components/Table/ListTable/index.vue'
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
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('ops.output'),
                  callback: function({ row, tableData }) {
                    openTaskPage(row.id)
                  }
                },
                {
                  name: 'run',
                  title: this.$t('ops.RunAgain'),
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
