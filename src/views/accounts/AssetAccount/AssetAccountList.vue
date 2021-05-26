<template>
  <Page>
    <el-row>
      <el-col :span="4">
        <AutoDataZTree
          ref="AUtoDataZTree"
          :setting="treeSetting"
        />
      </el-col>
      <el-col :span="12">
        <GenericListTable
          ref="LeftTable"
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="8">
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

export default {
  name: 'AssetAccountList',
  components: {
    AutoDataZTree, GenericListTable, Page, AssetUserTable
  },
  data() {
    const vm = this
    return {
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
          },
          rowClick: function(row, column, event) {
            vm.rightTable.url = `/api/v1/assets/asset-users/?asset_id=${row.id}&latest=1`
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasCreate: false,
          hasExport: false,
          hasImport: false,
          hasBulkDelete: false,
          hasBulkUpdate: false
        }
      },
      rightTable: {
        url: `/api/v1/assets/asset-users/?asset_id=&latest=1`,
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

<style scoped>

</style>
