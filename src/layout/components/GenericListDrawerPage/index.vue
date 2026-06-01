<template>
  <Page v-bind="$attrs">
    <DrawerListTable v-bind="$attrs" ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import DrawerListTable from '@/components/Table/DrawerListTable/index'

export default {
  name: 'GenericListDrawerPage',
  components: {
    Page, DrawerListTable
  },
  props: {
    tableConfig: {
      type: Object,
      required: true
    },
    headerActions: {
      type: Object,
      required: true
    }
  },
  data() {
    return {}
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
