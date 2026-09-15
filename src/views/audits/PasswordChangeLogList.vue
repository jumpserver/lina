<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/audits/password-change-logs/',
        columnsShow: {
          min: ['user', 'change_by'],
          default: ['user', 'change_by', 'remote_addr', 'datetime']
        },
        columnsMeta: {
          user: {
            label: this.$t('User')
          },
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasReportExport: true,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true,
          fieldLabels: {
            user: this.$t('User')
          }
        }
      }
    }
  }
}
</script>

<style></style>
