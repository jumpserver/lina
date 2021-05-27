<template>
  <Page>
    <el-row>
      <el-col v-show="iShowTree" :span="iShowTree?4:0">
        <AutoDataZTree
          ref="AUtoDataZTree"
          :setting="treeSetting"
        />
      </el-col>
      <el-col :span="iShowTree?12:14">
        <div class="mini">
          <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
            <i v-show="iShowTree" class="fa fa-angle-left fa-x" /><i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
          </div>
        </div>
        <GenericListTable
          ref="LeftTable"
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="iShowTree?8:10">
        <AssetUserTable
          ref="RightTable"
          :url="rightTable.url"
          :has-left-actions="true"
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
            'hostname', 'ip', 'public_ip', 'admin_user_display',
            'protocols', 'platform', 'connectivity',
            'created_by', 'date_created', 'comment', 'org_name'
          ],
          columnsShow: {
            min: ['hostname', 'ip', 'platform'],
            default: ['hostname', 'ip', 'connectivity', 'platform']
          },
          columnsMeta: {
            hostname: {
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetDetail'
              },
              showOverflowTooltip: true
            }
          },
          rowClick: function(row, column, event) {
            vm.rightTable.url = `/api/v1/assets/asset-users/?asset_id=${row.id}&latest=1`
          }
        },
        headerActions: {
          hasLeftActions: true,
          hasCreate: false,
          hasExport: false,
          hasImport: false,
          hasBulkDelete: false,
          hasBulkUpdate: false
        }
      },
      rightTable: {
        url: `/api/v1/assets/asset-users/?hostname=ShowFirstAssetRelated&latest=1`,
        tableConfig: {
          columns: ['name', 'username', 'version', 'date_created', 'actions'],
          columnsShow: {
            min: ['username', 'actions'],
            default: ['username', 'version', 'date_created', 'actions']
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .mini-button{
    width: 12px;
    float: left;
    text-align: center;
    padding: 5px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 3px;
    line-height: 1.428;
    cursor:pointer;
  }
</style>
