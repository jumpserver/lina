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
  computed: {
  },
  created() {
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style scoped>

</style>
