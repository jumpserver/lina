<template>
  <div class="connectivity-records">
    <DrawerListTable
      :key="url"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :drawer-props="{ connectivityType: drawerType }"
      reload-order-query="-date_start,-id"
    />
  </div>
</template>

<script>
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import { ChoicesFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { getConnectivityConfigForRow } from './config'

export default {
  name: 'ConnectivityRecordList',
  components: { DrawerListTable },
  props: {
    executionId: { type: String, default: '' },
    automationId: { type: String, default: '' }
  },
  data() {
    return {
      drawerType: '',
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        searchConfig: {
          getUrlQuery: true,
          excludeFields: ['id'],
          fieldLabels: {
            execution_id: this.$t('ExecutionID'),
            automation_id: this.$t('TaskID'),
            type: this.$t('Type')
          },
          fieldMenuClass: 'connectivity-record-filter-popper'
        }
      }
    }
  },
  computed: {
    url() {
      const query = new URLSearchParams()
      if (this.executionId) query.set('execution_id', this.executionId)
      if (this.automationId) query.set('automation_id', this.automationId)
      return `/api/v1/accounts/connectivity-records/${query.size ? `?${query}` : ''}`
    },
    tableConfig() {
      return {
        name: 'ConnectivityRecords',
        url: this.url,
        hasSelection: true,
        columns: [
          'id',
          'asset',
          'account',
          'username',
          'privileged',
          'status',
          'date_start',
          'error'
        ],
        columnsMeta: {
          actions: { has: false },
          asset: {
            label: this.$t('Asset'),
            minWidth: 200,
            formatter: (row) => {
              const name = row.asset || row.asset_id || '-'
              return row.asset_address ? `${name} (${row.asset_address})` : name
            }
          },
          account: {
            label: this.$t('Account'),
            minWidth: 140,
            formatter: (row) => row.account || '-'
          },
          username: {
            label: this.$t('Username'),
            minWidth: 140,
            formatter: (row) => row.username || row.account_id || '-'
          },
          privileged: {
            label: this.$t('Privileged'),
            width: 120,
            formatter: ChoicesFormatter,
            formatterArgs: {
              showText: false,
              showFalse: true,
              hasTips: true,
              faChoices: { true: 'fa-check-circle', false: 'fa-times-circle', unknown: 'fa-minus' },
              getKey: ({ cellValue }) => (cellValue == null ? 'unknown' : String(cellValue)),
              getTips: ({ cellValue }) =>
                this.$t(cellValue == null ? 'Unknown' : cellValue ? 'Yes' : 'No')
            }
          },
          status: {
            label: this.$t('Result'),
            width: 130,
            formatter: ChoicesFormatter,
            formatterArgs: {
              faChoices: { success: 'fa-check-circle', failed: 'fa-times-circle' },
              classChoices: { success: 'text-primary', failed: 'text-danger' }
            }
          },
          date_start: { label: this.$t('DateStart'), width: 190 },
          error: {
            label: this.$t('Error'),
            width: 240,
            className: 'connectivity-record-error',
            showOverflowTooltip: {
              popperStyle: {
                maxWidth: '480px',
                overflowWrap: 'anywhere',
                whiteSpace: 'normal'
              }
            },
            formatter: (row) => row.error || '-'
          },
          execution: {
            label: this.$t('ExecutionDetail'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: ({ row }) =>
                this.$hasPerm(getConnectivityConfigForRow(row).viewExecutionPermission),
              getRoute: ({ row }) => ({
                name: getConnectivityConfigForRow(row).executionDetailRoute,
                params: { id: row.execution }
              }),
              beforeClick: ({ row }) => {
                this.drawerType = getConnectivityConfigForRow(row).type
              },
              drawer: true
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.connectivity-records :deep(.el-table__body td.connectivity-record-error.el-table__cell .cell) {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>

<style lang="scss">
.tag-search-field-popper.connectivity-record-filter-popper {
  border-radius: 6px;

  .el-cascader-menu {
    min-width: 140px;
  }

  .el-cascader-menu__list {
    padding: 4px 0;
  }

  .el-cascader-node,
  .field-menu-option {
    height: 32px;
  }

  .field-menu-option {
    padding: 0 28px 0 14px;
  }
}
</style>
