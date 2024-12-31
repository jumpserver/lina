<template>
  <TwoCol>
    <GenericListTable
      ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <GatewayDialog
      :cell="cell"
      :port="port"
      :visible.sync="visible"
    />
    <AddGatewayDialog :object="object" :setting="AddGatewaySetting" @close="handleAddGatewayDialogClose" />
  </TwoCol>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import GatewayDialog from '@/components/Apps/GatewayDialog'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import { ArrayFormatter, ChoicesFormatter, DetailFormatter, TagsFormatter } from '@/components/Table/TableFormatters'
import AddGatewayDialog from '@/views/assets/Domain/components/AddGatewayDialog'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
    GenericListTable,
    GatewayDialog,
    AddGatewayDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/assets/gateways/?domain=${this.$route.params.id}&platform=Gateway`,
        columnsExclude: [
          'info', 'spec_info', 'auto_config'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'address',
            'connectivity', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.id }
                }
              }
            },
            sortable: true
          },
          type: { formatter: ChoicesFormatter },
          category: { formatter: ChoicesFormatter },
          address: {
            sortable: 'custom',
            width: '140px'
          },
          platform: {
            width: '100px',
            sortable: true
          },
          protocols: {
            formatter: (row) => {
              const data = row.protocols.map(p => <el-tag size='mini'>{p.name}/{p.port} </el-tag>)
              return <span> {data} </span>
            }
          },
          nodes_display: {
            formatter: ArrayFormatter
          },
          labels: {
            formatter: TagsFormatter,
            formatterArgs: {
              getTags(cellValue) {
                return cellValue.map(item => `${item.name}:${item.value}`)
              }
            }
          },
          connectivity: connectivityMeta,
          actions: {
            formatterArgs: {
              updateRoute: {
                name: 'GatewayUpdate',
                query: { domain: this.object.id, platform_type: 'linux', 'category': 'host' }
              },
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/assets/gateways/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'RemoveGateWay',
                  order: 10,
                  can: this.$hasPerm('assets.test_assetconnectivity') && !this.$store.getters.currentOrgIsRoot,
                  title: this.$t('Remove'),
                  callback: function(val) {
                    this.removeGateway(val)
                  }.bind(this)
                },
                {
                  name: 'TestConnection',
                  can: this.$hasPerm('assets.test_assetconnectivity') && !this.$store.getters.currentOrgIsRoot,
                  title: this.$t('TestConnection'),
                  callback: function(val) {
                    this.visible = true
                    const port = val.row.protocols.find(item => item.name === 'ssh').port
                    if (!port) {
                      return this.$message.error(this.$tc('BadRequestErrorMsg'))
                    } else {
                      this.port = port
                      this.cell = val.row.id
                    }
                  }.bind(this)
                }
              ],
              onClone: function({ row }) {
                const cloneRoute = {
                  name: 'GatewayCreate',
                  query: {
                    domain: this.object.id,
                    platform_type: row.type.value,
                    clone_from: row.id
                  }
                }
                this.$router.push(cloneRoute)
              }.bind(this)
            }
          }

        }
      },
      headerActions: {
        hasBulkUpdate: false,
        hasSearch: true,
        extraMoreActions: [
          {
            name: this.$t('RemoveSelected'),
            title: this.$t('RemoveSelected'),
            type: 'primary',
            icon: 'fa fa-minus',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: function(rows) {
              this.removeGateway(rows)
            }.bind(this)
          }
        ],
        createRoute: {
          name: 'GatewayCreate',
          query: {
            domain: this.object.id,
            platform_type: 'linux',
            category: 'host'
          }
        },
        extraActions: [
          {
            name: 'GatewayAdd',
            title: this.$t('Add'),
            callback: function() {
              this.AddGatewaySetting.AddGatewayDialogVisible = true
            }.bind(this)
          }
        ]
      },
      port: 0,
      cell: '',
      visible: false,
      AddGatewaySetting: {
        AddGatewayDialogVisible: false
      }
    }
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.$refs.ListTable.reloadTable()
    },
    removeGateway(rows) {
      let patch_data
      let msg
      if (rows.hasOwnProperty('selectedRows')) {
        patch_data = rows.selectedRows.map(row => {
          return {
            id: row.id,
            domain: null
          }
        })
        msg = patch_data.length + ' ' + this.$t('Rows')
      } else {
        patch_data = [{
          id: rows.row.id,
          domain: null
        }]
        msg = rows.row.name
      }
      this.$confirm(this.$t('RemoveWarningMsg') + ' ' + msg + ' ?', {
        type: 'warning'
      }).then(() => {
        this.$axios.patch(`/api/v1/assets/gateways/`, patch_data).then(() => {
          this.reloadTable()
          this.$message.success(this.$t('RemoveSuccessMsg'))
        })
      }).catch(() => {
      })
    },
    handleAddGatewayDialogClose() {
      this.reloadTable()
    }

  }
}
</script>

<style>

</style>
