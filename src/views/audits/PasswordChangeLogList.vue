<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo, toSafeLocalDateStr } from '@/utils/common'

export default {
  components: {
    GenericListPage
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = now.toISOString()
    return {
      tableConfig: {
        url: '/api/v1/audits/password-change-logs/',
        columns: ['user', 'change_by', 'remote_addr', 'datetime'],
        columnsMeta: {
          user: {
            showOverflowTooltip: true
          },
          change_by: {
            showOverflowTooltip: true
          },
          remote_addr: {
            showOverflowTooltip: true
          },
          datetime: {
            width: '180px',
            formatter: function(row, cell, value) {
              return toSafeLocalDateStr(value)
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
