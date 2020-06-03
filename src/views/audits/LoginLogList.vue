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
        url: '/api/v1/audits/login-logs/',
        columns: ['username', 'type', 'ip', 'city', 'user_agent', 'mfa', 'reason', 'status', 'datetime'],
        columnsMeta: {
          user_agent: {
            width: '150px',
            showOverflowTooltip: true
          },
          ip: {
            width: '140px'
          },
          status: {
            width: '80px'
          },
          mfa: {
            label: 'MFA',
            width: '80px'
          },
          type: {
            width: '100px'
          },
          datetime: {
            width: '160px'
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
