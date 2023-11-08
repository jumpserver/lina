<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/labels/labels/',
        columnsShow: {
          default: ['name', 'value', 'res_count', 'date_created', 'date_updated', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
        }
      },
      headerActions: {}
    }
  }
}
</script>

<style>

</style>
