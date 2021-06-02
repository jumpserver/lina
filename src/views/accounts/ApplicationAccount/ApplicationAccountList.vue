<template>
  <Page>
    <el-row>
      <el-col :span="14">
        <GenericListTable
          ref="LeftTable"
          class="application-table"
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="10">
        <GenericListTable
          ref="RightTable"
          class="application-user-table"
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
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    GenericListTable, Page
  },
  data() {
    const vm = this
    return {
      clickedRow: {},
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
            name: {
              formatter: DetailFormatter,
              formatterArgs: {
                getRoute({ row, col, cellValue }) {
                  return {
                    'db': 'DatabaseAppDetail', 'remote_app': 'RemoteAppDetail', 'cloud': 'KubernetesAppDetail'
                  }[row.category]
                }
              },
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
            vm.rightTable.tableConfig.url = `/api/v1/applications/application-users/?application_id=${row.id}`
            vm.clickedRow = row
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
          },
          columnsMeta: {
            name: {
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'SystemUserDetail'
              },
              showOverflowTooltip: true
            },
            actions: {
              formatterArgs: {
                hasUpdate: true, // can set function(row, value)
                hasDelete: false, // can set function(row, value)
                hasClone: false,
                onUpdate({ row, col }) {
                  vm.$router.push({ name: 'SystemUserUpdate', params: { id: row.id }, query: { protocol: row.protocol }})
                }
              }
            }
          },
          tableAttrs: {
            stripe: false, // 斑马纹表格
            border: true, // 表格边框
            fit: true, // 宽度自适应,
            tooltipEffect: 'dark',
            rowClassName({ row, rowIndex }) {
              return 'row-background-color'
            }
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
  .application-table ::v-deep .row-clicked, .application-user-table ::v-deep .row-background-color {
    background-color: #f5f7fa;
  }
</style>
