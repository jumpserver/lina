<template>
  <div>
    <GenericListPage
      v-loading="loading"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />

    <OperateLogDetailDialog
      ref="DetailDialog"
    />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import OperateLogDetailDialog from './OperateLogDetail/DetailDialog'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage,
    OperateLogDetailDialog
  },
  data() {
    const vm = this
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = getDaysFuture(1, now).toISOString()
    return {
      url: '/api/v1/audits/operate-logs/',
      rowObj: {
        diff: ''
      },
      logDetailVisible: false,
      loading: false,
      tableConfig: {
        url: '/api/v1/audits/operate-logs/',
        columnsShow: {
          min: ['user', 'resource'],
          default: [
            'user', 'action_display', 'resource_type_display',
            'resource', 'remote_addr', 'datetime', 'actions'
          ]
        },
        columnsMeta: {
          resource_type: {
            width: '180px'
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
                    this.$refs.DetailDialog.show(row.id)
                    vm.loading = false
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
