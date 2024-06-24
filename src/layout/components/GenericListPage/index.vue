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
  activated() {
    this.reloadTable()
  },
  methods: {
    reloadTable() {
      setTimeout(() => {
        this.$refs.ListTable.reloadTable()
      }, 300)
    }
  }
}
</script>
