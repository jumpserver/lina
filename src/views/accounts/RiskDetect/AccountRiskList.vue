<template>
  <div>
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :quick-summary="quickSummary"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <BatchResolveDialog
      v-if="batchResolveDialog.visible"
      :visible.sync="batchResolveDialog.visible"
      v-bind="batchResolveDialog"
    />
    <RiskScanDialog
      v-if="detectDialog.visible"
      :asset="detectDialog.asset"
      :visible.sync="detectDialog.visible"
    />
  </div>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import RiskHandleFormatter from './RiskHandlerFormatter/index.vue'
import BatchResolveDialog from '@/views/accounts/RiskDetect/RiskHandlerFormatter/BatchResolveDialog.vue'
import RiskScanDialog from './RiskScanDialog.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'

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
        showMenu: (node) => {
          return node?.meta?.type === 'asset'
        },
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
            name: this.$t('RiskDetection'),
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
          title: this.$t('DateLastWeek'),
          filter: {
            'days': '7'
          }
        },
        {
          title: this.$t('DateLastMonth'),
          filter: {
            'days': '30'
          }
        },
        {
          title: this.$t('Pending'),
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
            formatter: DetailFormatter,
            formatterArgs: {
              can: vm.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getDrawerTitle: ({ row }) => row.asset.name,
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.asset.id }
                }
              },
              drawer: true
            }
          },
          username: {
            label: this.$t('Account'),
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
        hasImport: false,
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
              return selectedRows.length > 0 && vm.$hasPerm('accounts.change_accountrisk')
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.checkPayload()
  },
  methods: {
    checkPayload() {
      const payload = this.$route.query.payload

      if (!payload) return

      const queryParams = `&risk=${payload}`

      if (queryParams) {
        this.tableConfig.url += queryParams
      }
    }
  }
}
</script>
<style lang='scss' scoped>

</style>
