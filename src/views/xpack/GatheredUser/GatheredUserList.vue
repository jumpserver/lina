<template>
  <TreeTable :table-config="tableConfig" :tree-setting="treeSetting" :header-actions="headerActions" />
</template>

<script>
import TreeTable from '@/components/TreeTable'

export default {
  components: {
    TreeTable
  },
  data() {
    return {
      treeSetting: {
        showMenu: false,
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
      },
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasImport: false
      }
    }
  },
  methods: {
    onGatherUserTasks() {
      this.$router.push({ name: 'GatherUserTaskList' })
    }
  }
}
</script>

<style>

</style>
