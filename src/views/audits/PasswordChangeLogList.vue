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
        url: '/api/v1/audits/password-change-logs/',
        columnsShow: {
          min: ['user', 'change_by'],
          default: ['user', 'change_by', 'remote_addr', 'datetime']
        },
        columnsMeta: {
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true
      }
    }
  }
}
</script>

<style>

</style>
