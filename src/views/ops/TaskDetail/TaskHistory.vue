<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'

export default {
  name: 'TaskHistory',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/ops/tasks/${this.object.id}/executions/`,
        columns: [
          'id', 'state', 'is_finished', 'date_published', 'date_start', 'date_finished', 'actions'
        ],
        columnsMeta: {
          state: {
            label: this.$t('ops.state'),
            width: '120px',
            formatter: (row) => {
              switch (row.state) {
                case 'PENDING':
                  return <span><i Class='fa fa-spinner fa-spin' />{this.$t(`ops.${row.state}`)}</span>
                case 'RUNNING':
                  return <span><i Class='fa fa-spinner fa-spin' />{this.$t(`ops.${row.state}`)}</span>
                case 'SUCCESS':
                  return <span Class='text-success'><i Class='fa fa-check' />{this.$t(`ops.${row.state}`)}</span>
                case 'FAILURE':
                  return <span Class='text-danger'><i Class='fa fa-times' />{this.$t(`ops.${row.state}`)}</span>
              }
            }
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('ops.detail'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    return this.$router.push({ name: 'HistoryExecutionDetail', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
