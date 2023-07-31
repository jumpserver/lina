<template>
  <div>
    <JobRunDialog v-if="showJobRunDialog" :item="item" :visible.sync="showJobRunDialog" @submit="runJob" />
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import JobRunDialog from '@/views/ops/Job/JobRunDialog'
import { openTaskPage } from '@/utils/jms'

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
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'type', 'asset_amount', 'average_time_cost',
            'summary', 'comment', 'date_last_run', 'actions'
          ]
        },
        columns: [
          'name', 'type', 'summary', 'average_time_cost', 'asset_amount',
          'date_last_run', 'comment', 'date_updated', 'date_created', 'actions'
        ],
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
            width: '240px'
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
              canUpdate: this.$hasPerm('ops.change_job') && !this.$store.getters.currentOrgIsRoot,
              updateRoute: 'JobUpdate',
              hasDelete: true,
              canDelete: this.$hasPerm('ops.delete_job'),
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('ops.Run'),
                  name: 'run',
                  can: this.$hasPerm('ops.add_jobexecution') && !this.$store.getters.currentOrgIsRoot,
                  callback: ({ row }) => {
                    if (row?.use_parameter_define && row?.parameters_define) {
                      const params = JSON.parse(row.parameters_define)
                      if (Object.keys(params).length > 0) {
                        this.item = row
                        this.showJobRunDialog = true
                      }
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
        createRoute: 'JobCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        moreCreates: {
          callback: (item) => {
            this.$router.push({
              name: 'JobCreate',
              query: { type: item.name }
            })
          },
          dropdown: [
            {
              name: 'adhoc',
              title: this.$t('ops.Command') + this.$t('ops.Job'),
              has: true
            },
            {
              name: 'playbook',
              title: 'Playbook' + this.$t('ops.Job'),
              has: true
            }
          ]
        }
      }
    }
  },
  methods: {
    runJob(row, parameters) {
      this.$axios.post('/api/v1/ops/job-executions/', {
        job: row.id,
        parameters: parameters
      }).then((resp) => {
        openTaskPage(resp.task_id)
      })
    }
  }
}
</script>

<style>

</style>
