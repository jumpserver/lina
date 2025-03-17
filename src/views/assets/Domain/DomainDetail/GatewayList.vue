<template>
  <TwoCol>
    <GenericListTable
      ref="ListTable"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :resource="$tc('Gateway')"
      :table-config="tableConfig"
    />
    <GatewayTestDialog
      :cell="testConfig.cell"
      :port="testConfig.port"
      :visible.sync="testConfig.visible"
    />
    <AddGatewayDialog
      v-if="addGatewaySetting.addGatewayDialogVisible"
      :object="transObject"
      :setting="addGatewaySetting"
      @close="handleAddGatewayDialogClose"
    />
  </TwoCol>
</template>

<script>
import { GenericListTable } from '@/layout/components'
import GatewayTestDialog from '@/components/Apps/GatewayTestDialog'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import { ArrayFormatter, ChoicesFormatter, DetailFormatter, TagsFormatter } from '@/components/Table/TableFormatters'
import AddGatewayDialog from '@/views/assets/Domain/components/AddGatewayDialog'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
    GenericListTable,
    GatewayTestDialog,
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
    const vm = this

    return {
      createDrawer: () => import('@/views/assets/Domain/DomainDetail/GatewayCreateUpdate.vue'),
      detailDrawer: () => import('@/views/assets/Asset/AssetDetail'),
      transObject: {},
      tableConfig: {
        url: `/api/v1/assets/gateways/?domain=${this.object.id}`,
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
              onClone: ({ row }) => {
                this.$refs.ListTable.onClone({ row: { ...row, payload: 'pam_asset_clone' }})
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
              ]
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
        extraActions: [
          {
            name: 'GatewayAdd',
            title: this.$t('Add'),
            callback: async() => {
              // 由于修改成为了抽屉形式，导致传入到 AddGateway 组件中的 obj 任然为最初的数量，就会导致新增的 item 依然会出现可选的情况
              // 此时修改为在打开 AddGateway 额外从 tableConfig.url 的接口中获取最新的 gateways 数目
              try {
                const res = await this.$axios.get(this.tableConfig.url)

                if (res) {
                  this.transObject = {
                    ...this.object,
                    gateways: res.map(item => {
                      return {
                        name: item.name,
                        id: item.id
                      }
                    })
                  }
                }
              } catch (err) {
                throw new Error(err)
              }

              vm.$nextTick(() => {
                this.addGatewaySetting.addGatewayDialogVisible = true
              })
            }
          }
        ],
        onCreate: () => {
          vm.$route.query.domain = vm.object.id
          vm.$route.query.platform_type = 'linux'
          vm.$route.query.category = 'host'

          vm.$refs.ListTable.onCreate()
        }
      },
      testConfig: {
        port: 0,
        visible: false,
        cell: ''
      },
      addGatewaySetting: {
        addGatewayDialogVisible: false
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
