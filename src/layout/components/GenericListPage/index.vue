<template>
  <Page v-bind="$attrs">
    <GenericListTable ref="ListTable" v-bind="$attrs" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'GenericListPage',
  components: {
    Page, GenericListTable
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
