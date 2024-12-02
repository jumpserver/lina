<template>
  <div>
    <AccountListTable ref="table" v-bind="tableConfig" :origin="'pam'" />

    <Drawer v-if="showTableDetailDrawer" :title="drawerTitle" @close-drawer="showTableDetailDrawer = !showTableDetailDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import AssetDetail from '@/views/assets/Asset/AssetDetail'
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'
import AssetAccountDetail from '@/views/accounts/Account/AccountDetail/index.vue'

export default {
  name: 'AssetAccountList',
  components: {
    Drawer,
    AssetDetail,
    AccountListTable,
    AssetAccountDetail
  },
  data() {
    return {
      showTableDetailDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true,
        columnsMeta: {
          name: {
            formatter: (row) => {
              return (
                <span style={{ color: '#1c84c6', cursor: 'pointer' }} onClick={() => {
                  this.$route.params.id = row.id

                  this.currentTemplate = 'AssetAccountDetail'
                  this.showTableDetailDrawer = true
                  this.drawerTitle = this.$t('AssetAccountDetail')
                }}>
                  {row.name}
                </span>
              )
            }
          },
          asset: {
            formatter: (row) => {
              return (
                this.$hasPerm('assets.view_asset') ? (
                  <span
                    style={{ color: '#1c84c6', cursor: 'pointer' }}
                    onClick={() => {
                      this.$route.params.id = row.asset.id
                      this.currentTemplate = 'AssetDetail'
                      this.showTableDetailDrawer = true
                      this.drawerTitle = this.$t('AssetDetail')
                    }}
                  >
                    {row.name}
                  </span>
                ) : (
                  <span>{row.asset ? row.asset.name : ''}</span>
                )
              )
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

  ::v-deep .page.tab-page {
   .page-heading .el-row--flex {
      flex-wrap: wrap;

     .page-heading-left .el-button {
       display: none;
     }
   }

    //.page-content {
    //  height: 100% !important;
    //  overflow-x: unset;
    //
    //  .tab-page-content {
    //    height: calc(100% - 120px);
    //  }
    //}
  }

</style>
