<template>
  <TreeTable
    ref="TreeTablePage"
    component="TabTree"
    :tree-setting="treeSetting"
    :active-menu.sync="treeTabConfig.activeMenu"
    :tree-tab-config="treeTabConfig"
  >
    <slot>
      <AutoDataTable v-bind="tableConfig" />
    </slot>
  </TreeTable>
</template>

<script>
import TreeTable from '@/components/TreeTable'
import AutoDataTable from '@/components/AutoDataTable'

// 账号列表，资产选择，权限列表
export default {
  name: 'AssetTree',
  components: {
    TreeTable,
    AutoDataTable
  },
  props: {
    withAsset: {
      type: Boolean,
      default: true
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      treeTabConfig: {
      },
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showSearch: true,
        showAssets: false,
        url: '/api/v1/assets/accounts/',
        treeUrl: `/api/v1/assets/nodes/children/tree/?assets=` + (this.withAsset ? 1 : 0),
        callback: {
          onSelected: (event, treeNode) => this.getAccountsUrl(event, treeNode)
        }
      }
    }
  },
  methods: {
  }
}
</script>
