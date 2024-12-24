<template>
  <div>
    <AccountListTable ref="table" v-bind="tableConfig" :origin="'pam'" />
  </div>
</template>

<script>
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
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true,
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'AssetAccountList',
                params: { id: row.id },
                query: { type: 'pam' }
              })
            },
            formatter: DetailFormatter
          },
          asset: {
            formatter: DetailFormatter,
            formatterArgs: {
              isPam: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset.id },
                query: { type: 'pam', tab: 'Basic' }
              })
            }
          },
          connect: {
            width: '80px',
            formatter: (row) => {
              return (
                <span class='connect'>
                  <el-button type='primary' onClick={() => this.handlePamConnect(row)} size='mini' plain>
                    <i class='fa fa-desktop'/>
                  </el-button>
                </span>
              )
            }
          }
        }
      }
    }
  },
  async mounted() {
  },
  methods: {
    handlePamConnect(row) {
      if (row.asset.type.value === 'windows') return window.open(`/luna/pam_gui_connect/${row.asset.id}`, '_blank')

      window.open(`/luna/pam_terminal_connect/${row.asset.id}`, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
  .asset-table ::v-deep .row-clicked, .asset-user-table ::v-deep .row-background-color {
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
      color: #D4D6E6;
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
