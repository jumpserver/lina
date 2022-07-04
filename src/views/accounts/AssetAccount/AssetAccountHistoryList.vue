<template>
  <Page v-bind="$attrs">
    <AccountHistoryTable ref="table" :url="accountsUrl" :has-left-actions="true" />
  </Page>
</template>

<script>
import AccountHistoryTable from '@/components/AccountHistoryTable'

export default {
  name: 'AssetAccountHistoryList',
  components: {
    AccountHistoryTable
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      accountsUrl: `/api/v1/assets/accounts-history/?id=${this.$route.query.id}`
    }
  },
  methods: {
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
