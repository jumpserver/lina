<template>
  <ListTable ref="list" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import { DrawerListTable as ListTable } from '@/components'
import { ChoicesFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'
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
        hasSelection: true,
        url: `/api/v1/ops/task-executions/?task_id=${this.object.id}`,
        columns: [
          'id',
          'is_finished',
          'is_success',
          'time_cost',
          'date_start',
          'date_published',
          'date_finished',
          'actions'
        ],
        columnsShow: {
          default: [
            'id',
            'is_finished',
            'is_success',
            'time_cost',
            'date_start',
            'date_finished',
            'actions'
          ]
        },
        columnsMeta: {
          is_finished: {
            label: this.$t('IsFinished'),
            formatter: ChoicesFormatter,
            formatterArgs: {
              showText: false,
              hasTips: true,
              faChoices: {
                true: 'fa-circle-check',
                false: 'fa-clock'
              },
              classChoices: {
                true: 'text-primary',
                false: 'text-info'
              },
              getTips: ({ row }) =>
                `${this.$t('IsFinished')}: ${this.$t(row.is_finished ? 'Yes' : 'No')}`
            }
          },
          is_success: {
            label: this.$t('IsSuccess'),
            formatter: ChoicesFormatter,
            formatterArgs: {
              showText: false,
              hasTips: true,
              getKey: ({ row }) => (row.is_finished ? row.is_success : 'pending'),
              faChoices: {
                true: 'fa-circle-check',
                false: 'fa-circle-xmark',
                pending: 'fa-spinner fa-spin'
              },
              classChoices: {
                true: 'text-primary',
                false: 'text-danger',
                pending: 'text-info'
              },
              getTips: ({ row }) => {
                if (!row.is_finished) return this.$t(row.date_start ? 'Running' : 'Pending')
                return this.$t(row.is_success ? 'Success' : 'Failed')
              }
            }
          },
          time_cost: {
            label: this.$t('Time'),
            width: '100px',
            formatter: function (row) {
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
                  callback: function ({ row, tableData }) {
                    openTaskPage(row.id)
                  }
                },
                {
                  name: 'run',
                  title: this.$t('RunAgain'),
                  type: 'primary',
                  callback: function ({ row, tableData }) {
                    this.$axios
                      .post(`/api/v1/ops/task-executions/?from=${row.id}`, {})
                      .then((data) => {
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

<style scoped></style>
