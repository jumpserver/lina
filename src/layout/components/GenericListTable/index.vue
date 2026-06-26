<template>
  <ListTable v-bind="$attrs" ref="ListTable" class="list-table" />
</template>

<script>
import ListTable from '@/components/Table/ListTable/index'

export default {
  name: 'GenericListTable',
  components: {
    ListTable
  },
  activated() {},
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style scoped lang="scss">
.list-table {
  margin-bottom: 20px;
}
</style>
