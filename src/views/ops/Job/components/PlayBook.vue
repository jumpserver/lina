<template>
  <div>
    <GenericListTable
      ref="ListTable"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <JobRunDialog v-if="showJobRunDialog" :item="item" :visible.sync="showJobRunDialog" @submit="runJob" />
  </div>
</template>

<script>
import JobRunDialog from '@/views/ops/Job/JobRunDialog'
import GenericListTable from '@/components/Table/DrawerListTable'

import { openTaskPage } from '@/utils/jms'
import { ActionsFormatter, DateFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListTable,
    JobRunDialog
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/ops/Job/JobUpdateCreate.vue'),
      detailDrawer: () => import('@/views/ops/Job/JobDetail/index.vue'),
      item: {},
      tableConfig: {
        url: '/api/v1/ops/jobs/?type=playbook',
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'type', 'asset_amount', 'average_time_cost',
            'summary', 'date_last_run', 'actions'
          ]
        },
        columns: [
          'name', 'type', 'summary', 'average_time_cost', 'asset_amount',
          'date_last_run', 'comment', 'date_updated', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            width: '140px',
            formatter: DetailFormatter,
            formatterArgs: {
              can: true,
              getRoute: ({ row }) => ({
                name: 'JobDetail',
                params: { id: row.id }
              })
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
            label: this.$t('Summary'),
            formatter: (row) => {
              return row.summary['success'] + '/' + row.summary['total']
            }
          },
          average_time_cost: {
            formatter: (row) => {
              return row.average_time_cost.toFixed(2) + 's'
            }
          },
          asset_amount: {
            label: this.$t('AssetsOfNumber'),
            formatter: (row) => {
              return row.assets.length
            }
          },
          date_last_run: {
            width: '140px',
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
              onUpdate: ({ row, col }) => {
                vm.$router.push({
                  query: { _type: 'playbook' }
                })
                vm.$refs.ListTable.onUpdate({ row, col })
              },
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('Run'),
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
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        onCreate: () => {
          vm.$router.push({
            query: { _type: 'playbook' }
          })
          vm.$refs.ListTable.onCreate()
        }
      },
      showJobRunDialog: false
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
