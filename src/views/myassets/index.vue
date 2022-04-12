<template>
  <div>
    <Announcement />
    <GenericTreeListPage
      :table-config="tableConfig"
      :header-actions="headerActions"
      :tree-setting="treeSetting"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { SystemUserFormatter, DialogDetailFormatter } from '@/components/TableFormatters'
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
              const currentNodeId = treeNode.meta.data.id
              this.tableConfig.url = `/api/v1/perms/users/nodes/${currentNodeId}/assets/?cache_policy=1`
            }
          }.bind(this)
        }
      },
      tableConfig: {
        url: '/api/v1/perms/users/assets/',
        hasTree: true,
        columns: ['hostname', 'ip', 'system_users', 'platform', 'comment', 'actions'],
        columnsShow: {
          default: ['hostname', 'ip', 'system_users', 'platform', 'actions'],
          min: ['hostname', 'actions']
        },
        columnsMeta: {
          hostname: {
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
          ip: {
            sortable: 'custom',
            width: '150px'
          },
          system_users: {
            showOverflowTooltip: true,
            align: 'center',
            label: this.$t('assets.SystemUsers'),
            width: '120px',
            formatter: SystemUserFormatter,
            formatterArgs: {
              getUrl: ({ row }) => {
                return `/api/v1/perms/users/assets/${row.id}/system-users/?cache_policy=1`
              }
            }
          },
          platform: {
            width: '120px'
          },
          comment: {
            showOverflowTooltip: true,
            width: '100px'
          },
          actions: {
            width: '150px',
            align: 'center',
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
                  can: ({ row }) => row.is_active,
                  callback: ({ row }) => {
                    window.open(`/luna/?login_to=${row.id}`, '_blank')
                  }
                },
                {
                  name: 'favor',
                  type: 'info',
                  fa: ({ row }) => {
                    return this.checkFavorite(row.id) ? 'fa-star' : 'fa-star-o'
                  },
                  callback: ({ row }) => this.toggleFavorite(row.id)
                }
              ]
            }
          }
        },
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
      const formatterArgs = this.tableConfig.columnsMeta.actions.formatterArgs
      formatterArgs.loading = true
      this.$axios.get('/api/v1/assets/favorite-assets/').then(resp => {
        this.allFavorites = resp
        formatterArgs.loading = false
      })
    },
    favor(assetId) {
      const data = { asset: assetId }
      const url = '/api/v1/assets/favorite-assets/'
      this.$axios.post(url, data).then(
        () => this.allFavorites.push({ asset: assetId })
      )
    },
    disfavor(assetId) {
      const url = `/api/v1/assets/favorite-assets/?asset=${assetId}`
      this.$axios.delete(url).then(() => {
        this.allFavorites = this.allFavorites.filter(item => item['asset'] !== assetId)
      })
    },
    toggleFavorite(assetId) {
      const favorite = this.checkFavorite(assetId)
      if (favorite) {
        this.disfavor(assetId)
      } else {
        this.favor(assetId)
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

  .link-more {
    margin-left: 10px;
    border-bottom: solid 1px;
    font-size: 12px
  }
</style>
