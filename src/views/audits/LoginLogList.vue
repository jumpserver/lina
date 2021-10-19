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
        url: '/api/v1/audits/login-logs/',
        columns: [
          'username', 'type', 'backend', 'ip', 'city',
          'user_agent', 'mfa', 'reason_display', 'status', 'datetime'
        ],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          user_agent: {
            width: '150px',
            showOverflowTooltip: true
          },
          ip: {
            width: '140px'
          },
          city: {
            width: '90px'
          },
          status: {
            width: '85px',
            formatterArgs: {
              classChoices: {
                true: 'text-primary',
                false: 'text-danger'
              }
            }
          },
          mfa: {
            label: 'MFA',
            width: '80px'
          },
          type: {
            width: '110px'
          },
          datetime: {
            width: '160px'
          },
          reason: {
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
