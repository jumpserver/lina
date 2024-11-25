<template>
  <div>
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :quick-filters="quickFilters"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
  </div>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import RiskHandleFormatter from './RiskHandlerFormatter/index.vue'

export default {
  components: {
    AssetTreeTable
  },
  data() {
    const vm = this
    return {
      gatherAccounts: [],
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showSearch: true,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/accounts/account-risks/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1&asset_amount=0',
        menu: [
          {
            id: 'check',
            name: this.$t('Check'),
            icon: 'scan',
            callback: () => {}
          }
        ]
      },
      quickFilters: [
        {
          label: '快速过滤',
          options: [
            {
              label: '未同步到资产',
              value: ''
            },
            {
              label: this.$t('最近一个月'),
              value: ''
            }
          ]
        },
        {
          label: this.$t('最近发现'),
          options: [
            {
              label: '最近一天 (20)',
              value: ''
            },
            {
              label: '最近一周 (300)',
              value: ''
            },
            {
              label: '最近一个月 (600)',
              value: ''
            }
          ]
        }
      ],
      tableConfig: {
        url: '/api/v1/accounts/account-risks/',
        columns: [
          'asset', 'username', 'risk', 'status',
          'date_created'
        ],
        columnsMeta: {
          asset: {
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return vm.$createElement('router-link', { props: { to }}, row.asset.name)
              } else {
                return vm.$createElement('span', row.asset.name)
              }
            }
          },
          username: {
            width: '120px'
          },
          risk: {
            formatter: (row) => {
              return (<el-tag size='mini' type='danger' effect='plain'>{row.risk.label}</el-tag>)
            }
          },
          status: {
            label: vm.$t('Pending'),
            width: '120px',
            formatter: RiskHandleFormatter,
            el: {
              'show-overflow-tooltip': false
            }
          },
          actions: {
            has: false
          }
        }
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  },
  mounted() {
  }
}
</script>
<style lang='scss' scoped>

</style>
