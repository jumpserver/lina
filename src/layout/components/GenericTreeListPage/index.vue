<template>
  <Page v-bind="pageAttrs">
    <TreeTable v-bind="treeTableAttrs" ref="TreeTable" v-on="forwardedListeners">
      <template #table>
        <slot name="table" />
      </template>
      <template #rMenu="{ data }">
        <slot :data="data" name="rMenu" />
      </template>
    </TreeTable>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import TreeTable from '@/components/Table/TreeTable'
import { mapGetters } from 'vuex'
import { omitVueListeners, pickVueListeners } from '@/utils/vue'

export default {
  name: 'GenericTreeListPage',
  components: {
    Page,
    TreeTable
  },
  inheritAttrs: false,
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    pageAttrs() {
      return omitVueListeners(this.$attrs)
    },
    forwardedListeners() {
      return pickVueListeners(this.$attrs)
    },
    treeTableAttrs() {
      const attrs = { ...this.pageAttrs }
      const headerActions = { ...(attrs['header-actions'] || {}) }
      if (this.currentOrgIsRoot) {
        if (headerActions.canCreate === undefined) {
          headerActions.canCreate = false
        }
        if (headerActions.hasImport === undefined) {
          headerActions.hasImport = false
        }
      }
      attrs['header-actions'] = headerActions
      return attrs
    }
  },
  methods: {
    hideRMenu() {
      this.$refs.TreeTable.hideRMenu()
    },
    getSelectedNodes: function () {
      return this.$refs.TreeTable.getSelectedNodes()
    },
    getNodes: function () {
      return this.$refs.TreeTable.getNodes()
    },
    selectNode: function (node) {
      return this.$refs.TreeTable.selectNode(node)
    },
    reloadTable() {
      this.$refs.TreeTable.reloadTable()
    }
  }
}
</script>

<style scoped></style>
