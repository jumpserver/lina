<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ConnectFormatter, SystemUserFormatter } from '@/components/ListTable/formatters'
export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/perms/users/assets/',
        nodeUrl: '/api/v1/perms/users/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/perms/users/nodes/children/tree/?cache_policy=2',
        callback: {
          refresh: () => {},
          onSelected: function(event, treeNode) {
            if (treeNode.meta.type === 'node') {
              const currentNodeId = treeNode.meta.node.id
              this.tableConfig.url = `/api/v1/perms/users/nodes/${currentNodeId}/assets/?cache_policy=1`
            }
          }.bind(this)
        }
      },
      tableConfig: {
        url: '/api/v1/perms/users/assets/',
        hasTree: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            formatter: DetailFormatter,
            sortable: true,
            align: 'center'
          },
          {
            prop: 'ip',
            align: 'center',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          },
          {
            prop: 'SystemUsers',
            align: 'center',
            formatter: SystemUserFormatter,
            label: this.$t('assets.SystemUsers'),
            width: '200px',
            getUrl: ({ row }) => {
              return `/api/v1/perms/users/assets/${row.id}/system-users/?cache_policy=1`
            }
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ConnectFormatter,
            width: '100px',
            label: this.$t('common.action'),
            actions: {
              onDelete: function({ row, col, cellValue, reload }) {
                // Todo: 对接api
                alert('接口错误：获取不到对应的资产状态')
              },
              onUpdate: function({ row, col, cellValue, reload }) {
                window.open(`/luna/?login_to=${cellValue}`, '_blank')
              }
            }
          }
        ]
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: true,
        hasRightActions: false
      }
    }
  }
}
</script>

<style>
</style>
