<template>
  <AssetTreeTable
    ref="TreeTablePage"
    :table-config="tableConfig"
    :tree-setting="treeSetting"
    @url-change="handleTreeUrlChange"
  >
    <template #table>
      <AccountListTable v-bind="tableConfig" ref="table" />
    </template>
  </AssetTreeTable>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { setRouterQuery } from '@/utils/common/index'

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
        selectSyncToRoute: false,
        url: '/api/v1/accounts/accounts/',
        countResource: 'account',
        edit: {
          drag: {
            isMove: false
          }
        }
      }
    }
  },
  methods: {
    handleTreeUrlChange(url) {
      this.tableConfig = {
        ...this.tableConfig,
        url
      }
      setRouterQuery(this, url, { browserOnly: true })
      this.$nextTick(() => {
        this.$refs.table?.refresh?.()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-table :deep(.row-clicked, .asset-user-table .row-background-color) {
  background-color: #f5f7fa;
}

.asset-table {
  &:hover {
    cursor: pointer;
  }

  & :deep(.table-content) {
    margin-left: 21px;
  }

  & :deep(.el-table__row) {
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
