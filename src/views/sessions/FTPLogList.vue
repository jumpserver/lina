<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
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
        url: '/api/v1/audits/ftp-logs/',
        columnsMeta: {
          remote_addr: {
            width: '140px'
          },
          operate: {
            width: '100px'
          },
          is_success: {
            width: '80px'
          },
          actions: {
            has: false
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
