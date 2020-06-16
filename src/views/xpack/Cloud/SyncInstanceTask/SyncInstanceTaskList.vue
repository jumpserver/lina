<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  components: {
    ListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/sync-instance-tasks/',
        columns: [
          'name', 'account_name', 'history_count', 'instance_count', 'periodic_display',
          'date_last_sync', 'comment', 'actions'
        ],
        columnsMeta: {
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => {
                this.$router.push({ name: 'SyncInstanceTaskUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  callback: function(data) {
                    this.$axios.get(`/api/v1/xpack/cloud/sync-instance-tasks/${data.row.id}/run/`).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                }
              ]
            }
          },
          name: {
            formatter: null
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        createRoute: 'SyncInstanceTaskCreate'
      }
    }
  }
}
</script>

<style>

</style>
