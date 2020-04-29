<template>
  <TreeTable :table-config="tableConfig" />
</template>

<script>
import { TreeTable } from '@/components'
import { DetailFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'TabAssetPerm',
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
    return {
      tableConfig: {
        url: `/api/v1/perms/user-groups/${this.object.id}/nodes/children/tree/?cache_policy=1`,
        hasTree: true,
        treeSetting: {
          showMenu: true,
          showRefresh: true,
          showAssets: false,
          url: '/api/v1/assets/assets/',
          nodeUrl: '/api/v1/assets/nodes/',
          // ?assets=0不显示资产. =1显示资产
          treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
        },
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
            label: this.$t('assets.System users'),
            align: 'center',
            formatter: () => {
              const title = this.$tc('Show')
              return <a> {title} </a>
            },
            width: '200px'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
