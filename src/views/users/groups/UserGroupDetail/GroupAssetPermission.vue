<template>
  <TreeTable :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import { DetailFormatter } from '@/components/ListTable/formatters'
import { TreeTable } from '@/components'

export default {
  name: 'GroupAssetPermission',
  components: {
    TreeTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: `/api/v1/perms/user-groups/${this.object.id}/assets/?cache_policy=1`,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: `/api/v1/perms/user-groups/${this.object.id}/nodes/children/tree/?cache_policy=1`,
        callback: {
          onSelected(event, node) {
            const url = `/api/v1/perms/user-groups/${vm.object.id}/nodes/${node.meta.node.id}/assets/?cache_policy=1&all=1`
            vm.tableConfig.url = url
            vm.$log.debug('Current node: ', url)
          }
        }
      },
      tableConfig: {
        url: `/api/v1/perms/user-groups/${this.object.id}/assets/?cache_policy=1`,
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
            formatter: () => {
              const title = this.$ttc('show')
              return <a> {title} </a>
            },
            width: '200px'
          }
        ]
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
