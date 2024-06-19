<template>
  <ListTable ref="ListTable" class="list-table" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import ListTable from '@/components/Table/ListTable/index'

export default {
  name: 'GenericListTable',
  components: {
    ListTable
  },
  activated() {
    setTimeout(() => {
      this.reloadTable()
    }, 300)
  },
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
