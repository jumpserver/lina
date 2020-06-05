<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { LoadingActionsFormatter, SystemUserFormatter, DialogDetailFormatter } from '@/components/ListTable/formatters'
export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      allFavorites: [],
      treeSetting: {
        showMenu: true,
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
            formatterArgs: {
              getDialogTile: function({ col, row, cellValue }) {
                return this.$t('assets.AssetDetail')
              }.bind(this),
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
                    key: this.$t('assets.Domain'),
                    value: row.domain
                  }
                ]
              }.bind(this)
            },
            sortable: true,
            align: 'center'
          },
          {
            prop: 'ip',
            align: 'center',
            label: this.$t('assets.ip'),
            sortable: 'custom'
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
            prop: 'id',
            align: 'center',
            formatter: LoadingActionsFormatter,
            width: '100px',
            label: this.$t('common.action'),
            formatterArgs: {
              hasDelete: false,
              loading: true,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'connect',
                  fa: 'fa-terminal',
                  type: 'primary',
                  callback: function({ row, col, cellValue, reload }) {
                    window.open(`/luna/?type=remote_app&login_to=${cellValue}`, '_blank')
                  }
                },
                {
                  name: 'favor',
                  type: 'info',
                  fa: function(row, cellValue) {
                    if (this.checkFavorite(cellValue)) {
                      return 'fa-star'
                    }
                    return 'fa-star-o'
                  }.bind(this),
                  callback: function({ row, col, cellValue, reload }) {
                    this.addOrDeleteFavorite(cellValue)
                  }.bind(this)
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: true,
        hasRightActions: false
      }
    }
  },
  mounted() {
    this.refreshAllFavorites()
  },
  methods: {
    refreshAllFavorites() {
      this.tableConfig.columns[3].formatterArgs.loading = true
      this.$axios.get('/api/v1/assets/favorite-assets/').then(resp => {
        this.allFavorites = resp
        this.tableConfig.columns[3].formatterArgs.loading = false
      })
    },
    addOrDeleteFavorite(assetId) {
      if (this.checkFavorite(assetId)) {
        this.$axios.delete(`/api/v1/assets/favorite-assets/?asset=${assetId}`).then(res => this.removeFavorite(assetId))
      } else {
        const data = {
          asset: assetId
        }
        this.$axios.post('/api/v1/assets/favorite-assets/', data).then(res => this.addFavorite(assetId))
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
</style>
