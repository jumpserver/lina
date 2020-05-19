<template>
  <GenericTreeListPage :table-config="tableConfig" :tree-setting="treeSetting" />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'

export default {
  components: {
    GenericTreeListPage
  },
  data() {
    return {
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: true,
        url: '/api/v1/assets/gathered-users/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/gathered-users/',
        hasTree: true,
        columns: [
          'hostname', 'ip', 'username', 'date_last_login', 'present', 'ip_last_login', 'date_updated'
        ],
        columnsMeta: {
        }
      }
    }
  }
}
</script>

<style>

</style>
