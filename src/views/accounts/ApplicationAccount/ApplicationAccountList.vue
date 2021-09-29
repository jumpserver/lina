<template>
  <GenericTreeListPage ref="TreeTablePage" :tree-setting="treeSetting">
    <template #table>
      <AppAccountListTable ref="table" :url="accountsUrl" />
    </template>
  </GenericTreeListPage>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import AppAccountListTable from '@/components/AppAccountListTable'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'AssetAccountList',
  components: {
    GenericTreeListPage, AppAccountListTable
  },
  data() {
    const vm = this
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      accountsUrl: '/api/v1/applications/accounts/',
      treeSetting: {
        async: false,
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        treeUrl: '/api/v1/applications/applications/tree/',
        callback: {
          onSelected: function(event, treeNode) {
            let url = '/api/v1/applications/accounts/'
            const nodeId = treeNode.id
            const value = treeNode.meta.data?.value
            if (treeNode.meta.type === 'category') {
              url = setUrlParam(url, 'category', value)
              url = setUrlParam(url, 'type', '')
            } else if (treeNode.meta.type === 'type') {
              url = setUrlParam(url, 'category', '')
              url = setUrlParam(url, 'type', value)
            } else if (treeNode.meta.type === 'application') {
              url = setUrlParam(url, 'category', '')
              url = setUrlParam(url, 'type', '')
              url = setUrlParam(url, 'app', nodeId)
            }
            setTimeout(() => {
              vm.accountsUrl = url
            }, 100)
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
