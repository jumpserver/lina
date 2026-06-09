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
  mounted() {
    console.log('[GenericListDrawerPage] mounted:', {
      headerActions: this.headerActions,
      headerActionsOnCreate: this.headerActions?.onCreate,
      headerActionsOnCreateType: typeof this.headerActions?.onCreate,
      attrs: this.$attrs,
      attrsOnCreate: this.$attrs?.['create-drawer'] || this.$attrs?.createDrawer
    })
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
