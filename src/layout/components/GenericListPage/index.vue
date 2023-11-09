<template>
  <Page v-bind="$attrs">
    <ListTable ref="ListTable" v-bind="$attrs" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import ListTable from '@/components/Table/ListTable/index'

export default {
  name: 'GenericListPage',
  components: {
    Page, ListTable
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
