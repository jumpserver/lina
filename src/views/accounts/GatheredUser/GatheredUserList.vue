<template>
  <div>
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
        <GenericListTable
          ref="RightTable"
          class="asset-user-table"
          :header-actions="rightTable.headerActions"
          :table-config="rightTable.tableConfig"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import AutoDataZTree from '@/components/AutoDataZTree/index'
import { ChoicesFormatter, DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetAccountList',
  components: {
    AutoDataZTree, GenericListTable
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
                route: 'AssetDetail',
                routeQuery: {
                  activeTab: 'Detail'
                }
              },
              showOverflowTooltip: true
            },
            connectivity: {
              label: this.$t('assets.Reachable'),
              formatter: ChoicesFormatter,
              formatterArgs: {
                iconChoices: {
                  0: 'fa-times text-danger',
                  1: 'fa-check text-primary',
                  2: 'fa-circle text-warning'
                },
                typeChange: function(val) {
                  if (!val) {
                    return 2
                  }
                  return val.status
                },
                hasTips: true
              },
              width: '90px',
              align: 'center'
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
            vm.rightTable.tableConfig.url = `/api/v1/assets/gathered-users/?asset_id=${row.id}`
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
          url: `/api/v1/assets/gathered-users/?asset__hostname=ShowFirstAssetRelated`,
          columns: [
            'username', 'date_last_login', 'present', 'ip_last_login', 'date_updated'
          ],
          columnsShow: {
            min: ['username'],
            default: [
              'username', 'date_last_login', 'present', 'ip_last_login', 'date_updated'
            ]
          },
          columnsMeta: {
            username: {
              showOverflowTooltip: true
            },
            present: {
              width: 80
            },
            ip_last_login: {
              width: 120
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
        headerActions: {
          hasLeftActions: false,
          hasCreate: false,
          hasExport: true,
          hasImport: false,
          hasBulkDelete: false,
          hasBulkUpdate: false
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
