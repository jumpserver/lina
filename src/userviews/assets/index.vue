<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { ActionsFormatter, SystemUserFormatter, DialogDetailFormatter } from '@/components/TableFormatters'
export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      allFavorites: [],
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/perms/users/assets/',
        nodeUrl: '/api/v1/perms/users/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/perms/users/nodes/children/tree/?cache_policy=2',
        callback: {
          refresh: () => {},
          onSelected: function(event, treeNode) {
            if (treeNode.meta.type === 'node') {
              const currentNodeId = treeNode.meta.node.id
              this.tableConfig.url = `/api/v1/perms/users/nodes/${currentNodeId}/assets/?cache_policy=1`
            }
          }.bind(this)
        }
      },
      tableConfig: {
        url: '/api/v1/perms/users/assets/',
        hasTree: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            formatter: DialogDetailFormatter,
            showOverflowTooltip: true,
            formatterArgs: {
              getDialogTitle: function({ col, row, cellValue }) { this.$t('assets.AssetDetail') }.bind(this),
              getDetailItems: function({ col, row, cellValue }) {
                return [
                  {
                    key: this.$t('assets.Hostname'),
                    value: row.hostname
                  },
                  {
                    key: this.$t('assets.ip'),
                    value: row.ip
                  },
                  {
                    key: this.$t('assets.Protocols'),
                    value: row.protocols.join(', ')
                  },
                  {
                    key: this.$t('assets.Platform'),
                    value: row.platform
                  },
                  {
                    key: this.$t('common.Activate'),
                    value: row.is_active
                  },
                  {
                    key: this.$t('assets.Comment'),
                    value: row.comment
                  }
                ]
              }.bind(this)
            },
            sortable: true
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom',
            width: '180px'
          },
          {
            prop: 'SystemUsers',
            align: 'center',
            label: this.$t('assets.SystemUsers'),
            width: '200px',
            formatter: SystemUserFormatter,
            formatterArgs: {
              getUrl: ({ row }) => {
                return `/api/v1/perms/users/assets/${row.id}/system-users/?cache_policy=1`
              }
            }
          },
          {
            prop: 'platform',
            label: this.$t('assets.Platform'),
            width: '120px'
          },
          {
            prop: 'comment',
            label: this.$t('assets.Comment'),
            showOverflowTooltip: true,
            width: '180px'
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ActionsFormatter,
            width: '100px',
            label: this.$t('common.action'),
            formatterArgs: {
              hasDelete: false,
              loading: true,
              hasClone: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'connect',
                  fa: 'fa-terminal',
                  type: 'primary',
                  can: function({ row, cellValue }) {
                    return row.is_active
                  },
                  callback: function({ row, col, cellValue, reload }) {
                    window.open(`/luna/?login_to=${row.id}`, '_blank')
                  }
                },
                {
                  name: 'favor',
                  type: 'info',
                  fa: function({ row, cellValue }) {
                    if (this.checkFavorite(row.id)) {
                      return 'fa-star'
                    }
                    return 'fa-star-o'
                  }.bind(this),
                  callback: function({ row, col, cellValue, reload }) {
                    this.addOrDeleteFavorite(row.id)
                  }.bind(this)
                }
              ]
            }
          }
        ],
        tableAttrs: {
          rowClassName({ row }) {
            return !row.is_active ? 'row_disabled' : ''
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasLeftActions: false,
        hasSearch: true
      }
    }
  },
  mounted() {
    this.refreshAllFavorites()
  },
  methods: {
    refreshAllFavorites() {
      const actionsIndex = this.tableConfig.columns.length - 1
      this.tableConfig.columns[actionsIndex].formatterArgs.loading = true
      this.$axios.get('/api/v1/assets/favorite-assets/').then(resp => {
        this.allFavorites = resp
        this.tableConfig.columns[actionsIndex].formatterArgs.loading = false
      })
    },
    addOrDeleteFavorite(assetId) {
      if (this.checkFavorite(assetId)) {
        this.$axios.delete(`/api/v1/assets/favorite-assets/?asset=${assetId}`).then(
          res => this.removeFavorite(assetId)
        )
      } else {
        const data = {
          asset: assetId
        }
        this.$axios.post('/api/v1/assets/favorite-assets/', data).then(
          res => this.addFavorite(assetId)
        )
      }
    },
    checkFavorite(assetId) {
      let ok = false
      this.allFavorites.forEach(element => {
        if (element['asset'] === assetId) {
          ok = true
        }
      })
      return ok
    },
    removeFavorite(assetId) {
      this.allFavorites = this.allFavorites.filter(item => item['asset'] !== assetId)
    },
    addFavorite(assetId) {
      this.allFavorites.push({ asset: assetId })
    }
  }
}
</script>

<style>
  .el-card {
    border: 0 !important;
  }
  .row_disabled,.row_disabled:hover,.row_disabled:hover > td{
    cursor: not-allowed;
    background-color:rgba(192,196,204,0.28) !important;
  }
</style>
