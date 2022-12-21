<template>
  <div>
    <JobRunDialog v-if="showJobRunDialog" :visible.sync="showJobRunDialog" :item="item" @submit="runJob" />
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter, DateFormatter } from '@/components/TableFormatters'
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
          'name', 'type', 'summary', 'average_time_cost', 'asset_amount',
          'date_last_run', 'comment', 'date_updated', 'date_created', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'type', 'asset_amount', 'average_time_cost',
            'summary', 'comment', 'date_last_run', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          type: {
            width: '96px',
            formatter: (row) => {
              return row.type.label
            }
          },
          comment: {
            width: '240px',
            formatter: (row) => {
              return row.type.label
            }
          },
          summary: {
            label: this.$t('ops.Summary(success/total)'),
            width: '140px',
            formatter: (row) => {
              return row.summary['success'] + '/' + row.summary['total']
            }
          },
          average_time_cost: {
            label: this.$t('ops.AverageTimeCost'),
            width: '140px',
            formatter: (row) => {
              return row.average_time_cost.toFixed(2) + 's'
            }
          },
          asset_amount: {
            width: '140px',
            label: this.$t('ops.AssetAmount'),
            formatter: (row) => {
              return row.assets.length
            }
          },
          date_last_run: {
            width: '140px',
            label: this.$t('ops.DateLastRun'),
            formatter: DateFormatter
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
                    const params = JSON.parse(row.parameters_define)
                    if (Object.keys(params).length > 0) {
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
        hasMoreActions: true,
        extraActions: [
          {
            name: this.$t('ops.QuickJob'),
            title: this.$t('ops.QuickJob'),
            has: () => {
              return true
            },
            callback: () => {
              this.$router.push({ name: 'QuickJob' })
            }
          }
        ]
      }
    }
  },
  methods: {
    runJob(row, parameters) {
      this.$axios.post('/api/v1/ops/job-executions/', {
        job: row.id,
        parameters: parameters
      }).then(() => {
        this.$message.success(this.$tc('ops.TaskDispatch'))
        this.$router.push({ name: 'Executions' })
      })
    }
  }
}
</script>

<style>

</style>
