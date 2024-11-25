<template>
  <div>
    <AccountListTable ref="table" v-bind="tableConfig" />
  </div>
</template>

<script>
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'

export default {
  name: 'AssetAccountList',
  components: {
    AccountListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true,
        columnsMeta: {
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
      window.open(`/luna/pam_connect/${row.asset.id}`, '_blank')
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
