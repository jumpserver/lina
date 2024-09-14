<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" :help-tip="helpMsg" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMsg: this.$t('AuditsLogHelpMsg'),
      tableConfig: {
        permissions: {
          app: 'audits',
          resource: 'userloginlog'
        },
        columnsShow: {
          min: ['username', 'status'],
          default: [
            'username', 'backend_display', 'city',
            'reason_display', 'status', 'datetime'
          ]
        },
        url: '/api/v1/audits/login-logs/',
        columnsMeta: {
          actions: {
            has: false
          },
          mfa: {
            width: '120px'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true
        }
      }
    }
  }
}
</script>
