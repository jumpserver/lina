<template>
  <TreeTable :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import { DetailFormatter } from '@/components/ListTable/formatters'
import TreeTable from '../TreeTable'

export default {
  name: 'GrantedAssets',
  components: {
    TreeTable
  },
  props: {
    treeUrl: {
      type: String,
      required: true
    },
    tableUrl: {
      type: String,
      required: true
    },
    onSelected: {
      type: Function,
      default(node, vm) {
        if (!vm.tableConfig.initialUrl) {
          vm.tableConfig.initialUrl = vm.tableConfig.url
        }
        const initialUrl = vm.tableConfig.initialUrl
        const nodeId = node.meta.node.id
        const url = initialUrl.replace('/assets/', `/nodes/${nodeId}/assets/`)
        vm.tableConfig.url = url
      }
    }
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: this.tableUrl,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: this.treeUrl,
        callback: {
          onSelected: (event, node) => vm.onSelected(node, vm)
        }
      },
      tableConfig: {
        url: this.tableUrl,
        hasTree: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.hostname'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AssetDetail'
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          },
          {
            prop: 'systemUsers',
            label: this.$t('assets.systemUsers'),
            align: 'center',
            formatter: (row, col, value) => {
              const title = this.$t('common.show')
              // Todo: 显示真正的系统用户
              const show = function() {
                console.log('hello: ', value)
              }
              return <el-link type='success' onClick={show}> {title} </el-link>
            },
            width: '200px'
          }
        ]
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  },
  methods: {

  }
}
</script>

<style scoped>
</style>
