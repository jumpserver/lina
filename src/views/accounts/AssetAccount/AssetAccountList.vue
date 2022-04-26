<template>
  <GenericTreeListPage ref="TreeTablePage" :tree-setting="treeSetting">
    <template #table>
      <AccountListTable ref="table" :url="accountsUrl" :has-left-actions="true" />
    </template>
  </GenericTreeListPage>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import AccountListTable from '@/components/AccountListTable'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'AssetAccountList',
  components: {
    GenericTreeListPage, AccountListTable
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      accountsUrl: '/api/v1/assets/accounts/',
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/accounts/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1',
        callback: {
          onSelected: (event, treeNode) => this.getAccountsUrl(event, treeNode)
        }
      }
    }
  },
  methods: {
    getAccountsUrl(event, treeNode) {
      let url = '/api/v1/assets/accounts/'
      if (treeNode.meta.type === 'node') {
        const nodeId = treeNode.meta.data.id
        url = setUrlParam(url, 'asset', '')
        url = setUrlParam(url, 'node', nodeId)
      } else if (treeNode.meta.type === 'asset') {
        const assetId = treeNode.meta.data.id
        url = setUrlParam(url, 'node', '')
        url = setUrlParam(url, 'asset', assetId)
      }
      this.accountsUrl = url
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
  .mini-button{
    width: 12px;
    float: left;
    margin-right: 10px;
    text-align: center;
    padding: 9px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 5px;
    line-height: 1.428;
    cursor:pointer;
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
