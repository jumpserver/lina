<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
    <Dialog v-if="relationDialog.show" :visible.sync="relationDialog.show" :title="this.$t('audits.Hosts')" :show-cancel="false" :show-confirm="false">
      <ListTable :table-config="relationDialog.tableConfig" :header-actions="relationDialog.headerActions" />
    </Dialog>
  </div>
</template>

<script type="text/jsx">
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo } from '@/utils/common'
import { Dialog, ListTable } from '@/components'
import { DisplayFormatter } from '@/components/ListTable/formatters'
import { setUrlParam } from '@/utils/common'

export default {
  components: {
    GenericListPage, Dialog, ListTable
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = now.toISOString()
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/audits/command-execution-logs/',
        columns: [
          'hosts', 'user', 'command', 'run_as', 'result', 'is_finished',
          'is_success', 'date_start'
        ],
        columnsMeta: {
          hosts: {
            formatter: (row, col, cellValue) => {
              const onClick = () => {
                console.log(vm.relationDialog)
                vm.relationDialog.tableConfig.url = setUrlParam(vm.relationDialog.tableConfig.url, 'commandexecution', row.id)
                vm.relationDialog.show = true
              }
              return <el-link onClick={onClick}>{ cellValue.length }</el-link>
            }
          },
          user: {
            formatter: DisplayFormatter
          },
          run_as: {
            formatter: DisplayFormatter
          },
          is_finished: {
            width: '100px'
          },
          is_success: {
            width: '100px'
          },
          result: {
            width: '80px',
            formatter: (row) => {
              const label = this.$t('audits.View')
              return <el-link Type='success'>{ label }</el-link>
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
      relationDialog: {
        show: false,
        tableConfig: {
          url: '/api/v1/audits/command-executions-hosts-relations/',
          columns: [
            {
              prop: 'asset_display',
              label: this.$t('audits.Hosts')
            }
          ]
        },
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false,
          tagSearch: []
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false,
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
