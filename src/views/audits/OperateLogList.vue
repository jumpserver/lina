<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDayEnd, getDaysAgo } from '@/utils/common'

export default {
  components: {
    GenericListPage
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = getDayEnd(now).toISOString()
    return {
      tableConfig: {
        url: '/api/v1/audits/operate-logs/',
        columns: ['user', 'action_display', 'resource_type_display', 'resource', 'remote_addr', 'datetime'],
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
            width: '90px'
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
