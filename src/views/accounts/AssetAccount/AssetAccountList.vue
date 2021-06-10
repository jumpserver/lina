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
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="iShowTree?11:13">
        <AssetUserTable
          ref="RightTable"
          class="asset-user-table"
          :url="rightTable.url"
          :has-left-actions="rightTable.hasLeftActions"
          :table-config="rightTable.tableConfig"
          :has-clone="false"
          :has-import="false"
        />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import AutoDataZTree from '@/components/AutoDataZTree/index'
import { AssetUserTable } from '@/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    AutoDataZTree, GenericListTable, Page, AssetUserTable
  },
  data() {
    const vm = this
    return {
      clickedRow: {},
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
          }
        }
      },
      leftTable: {
        tableConfig: {
          url: '/api/v1/assets/assets/',
          columns: [
            'hostname', 'ip', 'protocols', 'platform', 'comment'
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
            vm.rightTable.url = `/api/v1/assets/asset-users/?asset_id=${row.id}&latest=1`
            vm.clickedRow = row
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
        url: `/api/v1/assets/asset-users/?hostname=ShowFirstAssetRelated&latest=1`,
        tableConfig: {
          columns: ['name', 'username', 'version', 'backend_display', 'date_created', 'actions'],
          columnsShow: {
            min: ['username', 'actions'],
            default: ['name', 'username', 'version', 'backend_display', 'date_created', 'actions']
          },
          columnsMeta: {
            name: {
              formatter: null,
              showOverflowTooltip: true,
              sortable: false
            }
          },
          tableAttrs: {
            stripe: true, // 斑马纹表格
            border: true, // 表格边框
            fit: true, // 宽度自适应,
            tooltipEffect: 'dark',
            rowClassName({ row, rowIndex }) {
              return 'row-background-color'
            }
          }
        },
        hasLeftActions: false
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
    & >>> .table-content {
      margin-left: 21px;
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
</style>
