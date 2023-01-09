<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
      <Dialog
        v-if="dialogVisible"
        :destroy-on-close="true"
        :show-cancel="false"
        :show-confirm="false"
        :title="$tc('assets.TestGatewayTestConnection')"
        :visible.sync="dialogVisible"
        top="35vh"
        width="40%"
      >
        <el-row :gutter="20">
          <el-col :md="4" :sm="24">
            <div style="line-height: 34px">{{ $t('assets.SSHPort') }}</div>
          </el-col>
          <el-col :md="14" :sm="24">
            <el-input v-model="portInput" />
            <span class="help-tips help-block">{{ $t('assets.TestGatewayHelpMessage') }}</span>
          </el-col>
          <el-col :md="4" :sm="24">
            <el-button
              :loading="buttonLoading"
              size="mini"
              style="line-height:20px "
              type="primary"
              @click="dialogConfirm"
            >
              {{ this.$t('common.Confirm') }}
            </el-button>
          </el-col>
        </el-row>
      </Dialog>
    </el-col>
  </el-row>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import Dialog from '@/components/Dialog'
import { connectivityMeta } from '@/components/AccountListTable/const'
import { ArrayFormatter, ChoicesFormatter, DetailFormatter, TagsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListTable,
    Dialog
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
        url: `/api/v1/assets/gateways/?domain=${this.$route.params.id}`,
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'address', 'protocols', 'nodes_display', 'connectivity', 'comment', 'actions']
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
          labels_display: {
            formatter: TagsFormatter
          },
          connectivity: connectivityMeta,
          actions: {
            formatterArgs: {
              updateRoute: 'GatewayUpdate',
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/assets/gateways/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'TestConnection',
                  can: this.$hasPerm('assets.test_assetconnectivity'),
                  title: this.$t('assets.TestConnection'),
                  callback: function(val) {
                    this.dialogVisible = true
                    const port = val.row.protocols.find(item => item.name === 'ssh').port
                    if (!port) {
                      return this.$message.error(this.$tc('common.BadRequestErrorMsg'))
                    } else {
                      this.portInput = port
                      this.cellValue = val.row.id
                    }
                  }.bind(this)
                }
              ],
              onClone: function({ row }) {
                const cloneRoute = {
                  name: 'GatewayCreate',
                  query: {
                    domain: this.object.id,
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
        createRoute: {
          name: 'GatewayCreate',
          query: {
            domain: this.object.id
          }
        }
      },
      dialogVisible: false,
      portInput: '',
      cellValue: '',
      buttonLoading: false
    }
  },
  methods: {
    dialogConfirm() {
      this.buttonLoading = true
      const port = parseInt(this.portInput)

      if (isNaN(port)) {
        this.buttonLoading = false
        return this.$message.error(this.$tc('common.TestPortErrorMsg'))
      }
      this.$axios.post(`/api/v1/assets/gateways/${this.cellValue}/test-connective/`, { port: port })
        .then(() => {
          return this.$message.success(this.$tc('common.TestSuccessMsg'))
        }).finally(() => {
          this.portInput = ''
          this.cellValue = ''
          this.buttonLoading = false
          this.dialogVisible = false
        })
    }
  }
}
</script>

<style>

</style>
