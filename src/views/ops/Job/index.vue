<template>
  <div>
    <JobRunDialog v-if="showJobRunDialog" :visible.sync="showJobRunDialog" :item="item" @submit="runJob" />
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import JobRunDialog from '@/views/ops/Job/JobRunDialog'

export default {
  components: {
    JobRunDialog,
    GenericListPage
  },
  data() {
    return {
      item: {},
      runtime_parameters: {},
      showJobRunDialog: false,
      tableConfig: {
        url: '/api/v1/ops/jobs/',
        columns: [
          'name', 'type', 'asset_amount', 'comment', 'date_updated', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          asset_amount: {
            label: this.$t('ops.AssetAmount'),
            formatter: (row) => {
              return row.assets.length
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
                    if (row.parameters_define) {
                      this.item = row
                      this.showJobRunDialog = true
                    } else {
                      this.runJob(row)
                    }
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
    runJob(row, parameters) {
      console.log(row)
      this.$axios.post('/api/v1/ops/job-executions/', {
        job: row.id,
        parameters: parameters
      }).then(data => {
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
