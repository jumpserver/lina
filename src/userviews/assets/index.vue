<template>
  <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ActionsFormatter, BooleanFormatter } from '@/components/ListTable/formatters'
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
          refresh: () => {}
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
            prop: 'hardware_info',
            align: 'center',
            label: this.$t('assets.SystemUsers')
          },
          {
            prop: 'comment',
            align: 'center',
            label: this.$t('assets.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            label: this.$t('common.action'),
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
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
