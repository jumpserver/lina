<template>
  <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>

import { ListTable } from '@/components'

export default {
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    const tableUrl = `/api/v1/assets/assets/?platform=${this.object.id}`
    return {
      tableConfig: {
        url: tableUrl,
        category: 'all'
      },
      headerActions: {
        hasCreate: false,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select-dialog>>>.transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
