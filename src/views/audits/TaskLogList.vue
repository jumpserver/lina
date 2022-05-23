<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo, getDaysFuture } from '@/utils/common'

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
        permissions: {
          app: 'audits',
          resource: 'tasklog'
        },
        url: '/api/v1/audits/task-logs/',
        columns: [
          'type_display', 'event', 'result', 'datetime', 'is_success'
        ],
        columnsMeta: {
          type_display: {
            width: '120px'
          },
          datetime: {
            width: '160px'
          },
          event: {
            showOverflowTooltip: true
          },
          result: {
            showOverflowTooltip: true
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
