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
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/assets/gathered-users/',
        hasTree: true,
        columns: [
          'hostname', 'ip', 'username', 'date_last_login', 'present', 'ip_last_login', 'date_updated'
        ],
        columnsMeta: {
          hostname: {
            showOverflowTooltip: true
          },
          ip: {
            width: 120
          },
          username: {
            showOverflowTooltip: true
          },
          present: {
            width: 80
          },
          ip_last_login: {
            width: 120
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasLeftActions: false,
        hasImport: false,
        searchConfig: {
          exclude: ['asset', 'present'],
          options: [
            {
              label: this.$t('assets.Hostname'),
              value: 'asset__hostname'
            },
            {
              label: 'IP',
              value: 'asset__ip'
            }
          ]
        }
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
