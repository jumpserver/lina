<template>
  <Page v-bind="$attrs">
    <TreeTable
      ref="TreeTable"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template #table>
        <slot name="table" />
      </template>
      <div slot="rMenu" slot-scope="{data}">
        <slot :data="data" name="rMenu" />
      </div>
    </TreeTable>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import TreeTable from '@/components/Table/TreeTable'
import { mapGetters } from 'vuex'

export default {
  name: 'GenericTreeListPage',
  components: {
    Page,
    TreeTable
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  created() {
    const headerActions = this.$attrs['header-actions'] || {}
    if (headerActions.canCreate === undefined && this.currentOrgIsRoot) {
      _.set(this.$attrs, 'header-actions.canCreate', false)
    }
    if (headerActions.hasImport === undefined && this.currentOrgIsRoot) {
      _.set(this.$attrs, 'header-actions.hasImport', false)
    }
  },
  methods: {
    hideRMenu() {
      this.$refs.TreeTable.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.TreeTable.getSelectedNodes()
    },
    getNodes: function() {
      return this.$refs.TreeTable.getNodes()
    },
    selectNode: function(node) {
      return this.$refs.TreeTable.selectNode(node)
    },
    reloadTable() {
      this.$refs.TreeTable.reloadTable()
    }
  }
}
</script>

<style scoped>

</style>
