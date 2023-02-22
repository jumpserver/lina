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
          remote_addr: {
            width: '140px'
          },
          datetime: {
            width: '180px'
          },
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
