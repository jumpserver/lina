<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <TreeTable ref="TreeTable" :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting">
      <div slot="rMenu" slot-scope="{data}">
        <slot name="rMenu" :data="data" />
      </div>
    </TreeTable>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import TreeTable from '@/components/TreeTable'
export default {
  name: 'GenericTreeListPage',
  components: {
    Page, TreeTable
  },
  methods: {
    hideRMenu() {
      this.$refs.TreeTable.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.TreeTable.getSelectedNodes()
    }
  },
  props: {
    ...TreeTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  }

}
</script>

<style scoped>

</style>
