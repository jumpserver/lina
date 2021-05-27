<template>
  <Page>
    <el-row>
      <el-col :span="14">
        <GenericListTable
          ref="LeftTable"
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="10">
        <GenericListTable
          ref="RightTable"
          :header-actions="rightTable.headerActions"
          :table-config="rightTable.tableConfig"
        />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AssetAccountList',
  components: {
    GenericListTable, Page
  },
  data() {
    const vm = this
    return {
      leftTable: {
        tableConfig: {
          url: '/api/v1/applications/applications/',
          columns: [
            'name', 'category_display', 'type_display', 'created_by', 'date_created', 'date_updated',
            'comment', 'org_name'
          ],
          columnsShow: {
            min: ['name'],
            default: ['name', 'category_display', 'type_display']
          },
          columnsMeta: {
          },
          rowClick: function(row, column, event) {
            vm.rightTable.tableConfig.url = `/api/v1/applications/application-users/?application_id=${row.id}`
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
        tableConfig: {
          url: `/api/v1/applications/application-users/?application_id=`,
          columns: [
            'name', 'username', 'username_same_with_user', 'protocol', 'login_mode',
            'assets_amount', 'priority',
            'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
          ],
          columnsShow: {
            min: ['name', 'username', 'actions'],
            default: ['name', 'username', 'date_created', 'actions']
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasImport: false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
