<template>
  <div>
    <GenericListPage
      v-loading="loading"
      :table-config="tableConfig"
      :header-actions="headerActions"
    />
    <el-dialog
      :title="this.$t('route.OperateLog')"
      :visible.sync="logDetailVisible"
      width="70%"
    >
      <TwoTabFormatter :row="rowObj" />
    </el-dialog>
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import TwoTabFormatter from '@/components/TableFormatters/TwoTabFormatter'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage,
    TwoTabFormatter
  },
  data() {
    const vm = this
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = getDaysFuture(1, now).toISOString()
    return {
      rowObj: {
        left: '',
        right: '',
        leftTitle: vm.$t('audits.BeforeChange'),
        rightTitle: vm.$t('audits.AfterChange')
      },
      logDetailVisible: false,
      loading: false,
      tableConfig: {
        url: '/api/v1/audits/operate-logs/',
        columns: ['user', 'action_display', 'resource_type_display', 'resource', 'remote_addr', 'datetime', 'actions'],
        columnsMeta: {
          user: {
            showOverflowTooltip: true
          },
          resource_type: {
            showOverflowTooltip: true,
            width: '180px'
          },
          resource: {
            showOverflowTooltip: true
          },
          datetime: {
            width: '160px'
          },
          remote_addr: {
            width: '140px'
          },
          action_display: {
            width: '70px'
          },
          actions: {
            width: '70px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              canUpdate: false,
              hasDelete: false,
              canDelete: false,
              hasClone: false,
              canClone: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.loading = true
                    vm.$axios.get(
                      `/api/v1/audits/operate-logs/${row.id}/?type=action_detail`,
                    ).then(res => {
                      vm.rowObj.left = res.before
                      vm.rowObj.right = res.after
                      vm.logDetailVisible = true
                    }).finally(() => {
                      vm.loading = false
                    })
                  }
                }
              ]
            }
          }
        },
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
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
