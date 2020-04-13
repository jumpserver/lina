<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/applications/remote-apps/',
        columns: [
          'name', 'type', 'asset', 'comment', 'actions'
        ],
        columnsMeta: {
          type: {
            displayKey: 'get_type_display'
          },
          asset: {
            formatter: function(row, column, cellValue, index) {
              return <a class='detail el-link el-link--success is-underline' href={ `/assets/assets/${cellValue}` }>{ row.asset_info.hostname }</a>
            }
          }
        },
        detailRoute: 'RemoteAppDetail',
        actions: {
          updateRoute: 'RemoteAppUpdate'
        }
      },
      headerActions: {
        createRoute: 'RemoteAppCreate'
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
