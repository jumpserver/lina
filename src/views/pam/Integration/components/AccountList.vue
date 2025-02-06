<template>
  <AccountListTable ref="table" v-bind="tableConfig" />
</template>

<script>
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'
import { DetailFormatter, AccountConnectFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    AccountListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/accounts/accounts/?integrationapplication=${this.object.id}`,
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
            formatter: AccountConnectFormatter,
            formatterArgs: {
              buttonIcon: 'fa fa-desktop',
              titleText: '可选协议',
              url: '/api/v1/assets/assets/{id}',
              connectUrlTemplate: (row) => `/luna/pam_connect/${row.id}/${row.username}/${row.asset.id}/${row.asset.name}/`,
              setMapItem: (id, protocol) => {
                this.$store.commit('table/SET_PROTOCOL_MAP_ITEM', {
                  key: id,
                  value: protocol
                })
              }
            }
          }
        }
      }
    }
  },
  mounted() {
  },
  methods: {
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
</style>
