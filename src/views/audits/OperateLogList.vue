<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
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
        url: '/api/v1/audits/operate-logs/',
        columns: ['user', 'action', 'resource_type', 'resource', 'remote_addr', 'datetime'],
        columnsMeta: {
          datetime: {
            width: '160px'
          },
          remote_addr: {
            width: '140px'
          },
          action: {
            width: '90px'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false
      }
    }
  }
}
</script>

<style>

</style>
