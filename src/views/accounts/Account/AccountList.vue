<template>
  <AssetTreeTable ref="TreeTablePage" :table-config="tableConfig" :tree-setting="treeSetting">
    <template #table>
      <AccountListTable ref="table" v-bind="tableConfig" />
    </template>
  </AssetTreeTable>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    AssetTreeTable,
    AccountListTable
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
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
              getDrawerTitle: ({ row }) => row.asset.name,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset.id },
                query: { tab: 'Basic' }
              })
            }
          }
        }
      },
      treeSetting: {
        showMenu: false,
        showAssets: true,
        url: '/api/v1/accounts/accounts/',
        countResource: 'account',
        edit: {
          drag: {
            isMove: false
          }
        }
      }
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
