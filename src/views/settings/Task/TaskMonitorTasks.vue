<template>
  <div class="monitor-task-history">
    <p class="monitor-hint">{{ $t('TaskMonitorTasksHelp') }}</p>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" :fill-height="true" />
  </div>
</template>

<script>
import { h } from 'vue'
import ListTable from '@/components/Table/ListTable/index.vue'
import { TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'TaskMonitorTasks',
  components: { ListTable },
  data() {
    return {
      tableConfig: {
        name: 'TaskMonitorExecutions',
        url: '/api/v1/ops/task-executions/',
        hasSelection: true,
        columns: [
          'name',
          'uuid',
          'state',
          'args',
          'kwargs',
          'date_start',
          'date_finished',
          'actions'
        ],
        columnsShow: {
          default: ['name', 'uuid', 'state', 'args', 'date_start', 'date_finished', 'actions']
        },
        columnsMeta: {
          name: {
            minWidth: '300px',
            showOverflowTooltip: true,
            formatter: (row) => h('span', row.name)
          },
          uuid: {
            label: this.$t('TaskID'),
            width: '310px',
            formatter: (row) => h('span', row.id)
          },
          state: {
            label: this.$t('State'),
            width: '125px',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagType: ({ cellValue }) =>
                ({
                  SUCCESS: 'success',
                  FAILURE: 'danger',
                  RETRY: 'warning',
                  REVOKED: 'warning',
                  RUNNING: 'primary',
                  STARTED: 'primary'
                })[cellValue] || 'info'
            }
          },
          args: {
            label: this.$t('TaskMonitorArgs'),
            minWidth: '220px',
            showOverflowTooltip: true,
            formatter: (row) => JSON.stringify(row.args ?? [])
          },
          kwargs: {
            label: this.$t('TaskMonitorKwargs'),
            minWidth: '220px',
            showOverflowTooltip: true,
            formatter: (row) => JSON.stringify(row.kwargs ?? {})
          },
          actions: {
            width: '85px',
            formatterArgs: {
              hasEdit: false,
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('Log'),
                  icon: 'fa-eye',
                  callback: ({ row }) => openTaskPage(row.id)
                }
              ]
            }
          }
        }
      },
      headerActions: { hasLeftActions: false, hasImport: false }
    }
  }
}
</script>

<style scoped>
.monitor-task-history {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  gap: 12px;
}
.monitor-hint {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
