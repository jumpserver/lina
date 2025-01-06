<template>
  <AccountListTable ref="table" v-bind="tableConfig" />
</template>

<script>
import { mapGetters } from 'vuex'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'

export default {
  name: 'AssetAccountList',
  components: {
    AccountListTable
  },
  data() {
    return {
      drawerTitle: '',
      currentProtocol: '',
      perm_protocols: [],
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true,
        columnsMeta: {
          asset: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset.id },
                query: { tab: 'Basic' }
              })
            }
          },
          connect: {
            label: this.$t('Connect'),
            width: '80px',
            formatter: row => {
              return (
                <span class='connect'>
                  <el-dropdown
                    {...{
                      props: {
                        trigger: 'hover',
                        size: 'small',
                        showTimeout: 500
                      },
                      on: {
                        'visible-change': visible => {
                          if (visible) {
                            this.getPermdProtocols(row.asset.id)
                          }
                        },
                        'command': protocol => {
                          this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
                            key: row.id,
                            value: protocol
                          })

                          this.handleWindowOpen(row, protocol)
                        }
                      }
                    }}
                  >
                    <el-button
                      plain
                      size='mini'
                      type='primary'
                      onClick={() => this.handlePamConnect(row)}
                    >
                      <i class='fa fa-desktop'/>
                    </el-button>
                    <el-dropdown-menu slot='dropdown'>
                      <el-dropdown-item command='Title' disabled>
                        可选协议
                      </el-dropdown-item>
                      <el-dropdown-item divided/>
                      {this.perm_protocols.map(protocol => {
                        return (
                          <el-dropdown-item command={protocol.name}>
                            {protocol.name}
                          </el-dropdown-item>
                        )
                      })}
                    </el-dropdown-menu>
                  </el-dropdown>
                </span>
              )
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters(['protocolMap'])
  },
  async mounted() {
  },
  methods: {
    getAssetDetail(id) {
      const detailUrl = `/api/v1/assets/assets/${id}`

      return new Promise((resolve, reject) => {
        this.$axios
          .get(detailUrl)
          .then(res => {
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    handleWindowOpen(row, protocol) {
      window.open(
        `/luna/pam_connect/${row.id}/${row.username}/${row.asset.id}/${
          row.asset.name
        }/${protocol}`,
        '_blank'
      )
    },
    async handlePamConnect(row) {
      const protocolMap = this.protocolMap

      if (protocolMap.has(row.id)) {
        const protocol = protocolMap.get(row.id)
        this.handleWindowOpen(row, protocol)
      } else {
        try {
          const res = await this.getAssetDetail(row.asset.id)

          if (res) {
            const protocol = res.protocols[0]

            this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
              key: row.id,
              value: protocol.name
            })

            this.handleWindowOpen(row, protocol.name)
          }
        } catch (e) {
          console.log(e)
        }
      }
    },
    async getPermdProtocols(assetId) {
      try {
        const res = await this.getAssetDetail(assetId)

        if (res) {
          this.perm_protocols = res.protocols
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-table ::v-deep .row-clicked,
.asset-user-table ::v-deep .row-background-color {
  background-color: #f5f7fa;
}

.asset-table {
  &:hover {
    cursor: pointer;
  }

  & ::v-deep .table-content {
    margin-left: 21px;
  }

  & ::v-deep .el-table__row {
    height: 40px;

    & > td {
      padding: 0;
    }
  }
}

.noDataR {
  width: 100%;
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-direction: column;

  .hintWrap {
    color: #d4d6e6;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
  }
}

.asset-user-table {
  padding-left: 20px;
}

.el-dropdown-menu__item.is-disabled {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
</style>
