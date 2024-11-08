<template>
  <div>
    <GenericListPage ref="ListPage" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script type="text/jsx">
import GenericListPage from '@/layout/components/GenericListPage'
import { SwitchFormatter } from '@/components/Table/TableFormatters'
import { auditUpdateJob } from '@/api/ops'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/audits/jobs/',
        columnsShow: {
          min: ['name', 'material'],
          default: [
            'name', 'material', 'type', 'crontab', 'interval', 'created_by', 'is_periodic'
          ]
        },
        columns: [
          'name', 'args', 'material', 'type', 'crontab', 'interval', 'date_last_run', 'summary', 'created_by', 'is_periodic'
        ],
        columnsMeta: {
          name: {
            formatter: (row) => row.name
          },
          material: {
            width: '200px',
            label: this.$t('Command')
          },
          summary: {
            width: '130px',
            label: `${this.$t('Success')}/${this.$t('Total')}`,
            formatter: (row) => {
              return <div>
                <span Class='text-primary'>{row.summary.success}</span>/
                <span>{row.summary.total}</span>
              </div>
            }
          },
          is_periodic: {
            width: '120px',
            label: `${this.$t('Enable')}/${this.$t('Disable')}`,
            formatter: SwitchFormatter,
            formatterArgs: {
              isDisplay(row) {
                return row.crontab || row.interval
              },
              getPatchUrl(row) {
                return `/api/v1/ops/celery/period-tasks/run_ops_job_period_${row.id.slice(0, 8)}/`
              },
              getPatchData(row) {
                return {
                  enabled: !row.is_periodic
                }
              },
              callback(row) {
                auditUpdateJob(row.id, { is_periodic: false }).then(() => {
                  vm.$refs.ListPage.reloadTable()
                })
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false
      }
    }
  }
}
</script>

<style>
</style>
