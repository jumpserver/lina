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
          'name', 'ip', 'username', 'date_last_login', 'present',
          'ip_last_login', 'date_updated'
        ],
        columnsMeta: {
          name: {
            formatter: row => {
              return row?.name || '-'
            },
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
              label: this.$t('assets.Name'),
              value: 'asset__name'
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
