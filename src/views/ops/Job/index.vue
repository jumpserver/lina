<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/jobs/',
        columns: [
          'name', 'type', 'date_updated', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              canUpdate: true,
              updateRoute: 'JobUpdate',
              hasDelete: true,
              canDelete: true,
              hasClone: false,
              extraActions: [
                {
                  title: '执行',
                  name: 'run',
                  type: 'running',
                  can: true,
                  callback: ({ row }) => {
                    this.runJob(row)
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        canCreate: true,
        createRoute: 'JobCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  },
  methods: {
    runJob(row) {
      this.$axios.post('/api/v1/ops/job-executions/', { job: row.id }).then(data => {
        this.$axios.get(`/api/v1/ops/job-executions/${data.id}/`).then(d => {
          openTaskPage(d.task_id)
        })
      })
    }
  }
}
</script>

<style>

</style>
