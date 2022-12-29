<template>
  <Page v-bind="$attrs">
    <AssetTreeTAble ref="TreeTablePage" :tree-setting="treeSetting" :table-config="tableConfig">
      <template #table>
        <AccountListTable ref="table" v-bind="tableConfig" />
      </template>
    </AssetTreeTAble>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import AssetTreeTAble from '@/components/AssetTreeTable'
import AccountListTable from '@/components/AccountListTable/AccountList'

export default {
  name: 'AssetAccountList',
  components: {
    Page,
    AssetTreeTAble,
    AccountListTable
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true
      },
      treeSetting: {
        showMenu: false,
        showAssets: true,
        url: '/api/v1/accounts/accounts/'
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
    & >>> .table-content {
      margin-left: 21px;
    }
    & ::v-deep .el-table__row{
      height: 40px;
      & > td{
        padding: 0;
      }
    }
  }
  .noDataR{
    width: 100%;
    height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-direction: column;
    .hintWrap{
      color: #D4D6E6;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;
    }
  }
  .asset-user-table{
    padding-left: 20px;
  }
</style>
