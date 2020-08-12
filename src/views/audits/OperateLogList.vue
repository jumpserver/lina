<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo } from '@/utils/common'

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
        url: '/api/v1/audits/operate-logs/',
        columns: ['user', 'action', 'resource_type', 'resource', 'remote_addr', 'datetime'],
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
          action: {
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
