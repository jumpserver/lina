<template>
  <Page>
    <el-alert v-if="helpMessage" type="success"> {{ helpMessage }} </el-alert>
    <TreeTable ref="TreeTable" :table-config="tableConfig" :header-actions="iHeaderActions" :tree-setting="treeSetting">
      <template #table>
        <slot name="table" />
      </template>
      <div slot="rMenu" slot-scope="{data}">
        <slot name="rMenu" :data="data" />
      </div>
    </TreeTable>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import TreeTable from '@/components/TreeTable'
import { mapGetters } from 'vuex'
export default {
  name: 'GenericTreeListPage',
  components: {
    Page, TreeTable
  },
  props: {
    ...TreeTable.props,
    helpMessage: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    iHeaderActions() {
      const attrs = _.cloneDeep(this.headerActions)
      const canCreate = _.get(attrs, 'canCreate', null)
      if (canCreate === null && this.currentOrgIsRoot) {
        _.set(attrs, 'canCreate', false)
      }
      return attrs
    }
  },
  methods: {
    hideRMenu() {
      this.$refs.TreeTable.hideRMenu()
    },
    getSelectedNodes: function() {
      return this.$refs.TreeTable.getSelectedNodes()
    }
  }
}
</script>

<style scoped>

</style>
