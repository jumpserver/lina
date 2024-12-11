<template>
  <div>
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :quick-summary="quickSummary"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <BatchResolveDialog :visible.sync="batchResolveDialog.visible" v-bind="batchResolveDialog" />
    <RiskScanDialog v-if="detectDialog.visible" :asset="detectDialog.asset" :visible.sync="detectDialog.visible" />
  </div>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import RiskHandleFormatter from './RiskHandlerFormatter/index.vue'
import BatchResolveDialog from '@/views/pam/RiskDetect/RiskHandlerFormatter/BatchResolveDialog.vue'
import RiskScanDialog from './RiskScanDialog.vue'

export default {
  components: {
    RiskScanDialog,
    BatchResolveDialog,
    AssetTreeTable
  },
  data() {
    const vm = this
    return {
      gatherAccounts: [],
      scanVisible: false,
      detectDialog: {
        visible: false,
        asset: ''
      },
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
            callback: (node) => {
              vm.detectDialog.asset = node.id
              setTimeout(() => {
                vm.detectDialog.visible = true
              }, 100)
            }
          }
        ]
      },
      quickSummary: [
        {
          title: '最近一周发现',
          filter: {
            'days': '7'
          }
        },
        {
          title: '最近一月发现',
          filter: {
            'days': '30'
          }
        },
        {
          title: '待处理',
          filter: {
            status: '0'
          }
        }
      ],
      batchResolveDialog: {
        visible: false,
        risks: []
      },
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
        hasCreate: false,
        extraMoreActions: [
          {
            name: 'resolveSelected',
            title: this.$t('ResolveSelected'),
            icon: 'el-icon-check',
            callback: function({ selectedRows }) {
              vm.batchResolveDialog.risks = selectedRows
              vm.batchResolveDialog.visible = true
            },
            can: function({ selectedRows }) {
              return selectedRows.length > 0
            }
          }
        ]
      }
    }
  },
  mounted() {
  }
}
</script>
<style lang='scss' scoped>

</style>
