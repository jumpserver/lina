<template>
  <Page>
    <el-row>
      <el-col v-show="iShowTree" :span="iShowTree?4:0">
        <AutoDataZTree
          ref="AUtoDataZTree"
          :setting="treeSetting"
        />
      </el-col>
      <el-col :span="iShowTree?9:11">
        <div class="mini">
          <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
            <i v-show="iShowTree" class="fa fa-angle-left fa-x" />
            <i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
          </div>
        </div>
        <GenericListTable
          ref="LeftTable"
          class="asset-table"
          v-bind="leftTable"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="iShowTree?11:13">
        <AccountListTable
          v-if="!isInit"
          ref="RightTable"
          class="asset-user-table"
          v-bind="rightTable"
        />
        <div v-else class="noDataR">
          <div class="hintWrap">
            <div>
              {{ $t('accounts.PleaseClickLeftAssetToViewAssetAccount') }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import AutoDataZTree from '@/components/AutoDataZTree/index'
import { AccountListTable } from '@/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    AutoDataZTree, GenericListTable, Page, AccountListTable
  },
  data() {
    const vm = this
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      treeSetting: {
        showMenu: false,
        showRefresh: false,
        showAssets: false,
        url: '',
        treeUrl: '/api/v1/assets/nodes/children/tree/',
        callback: {
          onSelected: function(event, treeNode) {
            vm.leftTable.tableConfig.url = `/api/v1/assets/assets/?node_id=${treeNode.meta.node.id}`
            vm.isInit = true
          }
        }
      },
      leftTable: {
        tableConfig: {
          url: '/api/v1/assets/assets/',
          columns: [
            'hostname', 'ip', 'protocols', 'platform', 'comment', 'org_name'
          ],
          columnsShow: {
            min: ['hostname', 'ip'],
            default: ['hostname', 'ip', 'platform']
          },
          columnsMeta: {
            hostname: {
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetDetail',
                routeQuery: {
                  activeTab: 'Detail'
                }
              },
              showOverflowTooltip: true
            },
            ip: {
              showOverflowTooltip: true
            }
          },
          tableAttrs: {
            stripe: false, // 斑马纹表格
            border: true, // 表格边框
            fit: true, // 宽度自适应,
            tooltipEffect: 'dark',
            rowClassName({ row, rowIndex }) {
              if (row === vm.clickedRow) {
                return 'row-clicked'
              }
              return ''
            }
          },
          rowClick: function(row, column, event) {
            vm.rightTable.url = `/api/v1/assets/accounts/?asset=${row.id}`
            vm.rightTable.extraQuery.asset = row.id
            vm.clickedRow = row
            vm.isInit = false
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasCreate: false,
          hasExport: false,
          hasImport: false,
          hasBulkDelete: false,
          hasColumnSetting: true,
          hasRefresh: true,
          hasBulkUpdate: false
        }
      },
      rightTable: {
        url: `/api/v1/assets/accounts/`,
        name: 'AssetAccountListTable',
        extraQuery: {
          latest: 1
        },
        hasLeftActions: false,
        searchExclude: ['hostname', 'id', 'ip']
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
