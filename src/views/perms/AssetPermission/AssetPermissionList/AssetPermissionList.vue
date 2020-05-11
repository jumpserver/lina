<template>
  <ListTable :table-config="iTableConfig" :header-actions="iHeaderActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'AssetPermissionList',
  components: {
    ListTable
  },
  props: {
    ...ListTable.props
  },
  data() {
    return {
      iTableConfig: this.tableConfig,
      iHeaderActions: this.headerActions
    }
  }
}
</script>

<style scoped>

</style>
