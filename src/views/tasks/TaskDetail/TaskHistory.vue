<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { openTaskPage } from '@/utils/jms'

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
        url: `/api/v1/ops/task-executions/?task_id=${this.object.id}`,
        columns: [
          'date_start', 'date_finished', 'is_success', 'is_finished', 'actions'
        ],
        columnsMeta: {
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
                  title: this.$t('ops.output'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    openTaskPage(row.id)
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
