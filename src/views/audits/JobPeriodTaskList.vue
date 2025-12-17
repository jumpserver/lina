<template>
  <div>
    <GenericListPage ref="ListPage" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script lang="jsx">
import GenericListPage from '@/layout/components/GenericListPage'
import { SwitchFormatter } from '@/components/Table/TableFormatters'

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
          min: ['name', 'args'],
          default: [
            'name', 'args', 'type', 'crontab', 'interval', 'created_by', 'is_periodic_display', 'is_periodic'
          ]
        },
        columns: [
          'name', 'args', 'type', 'crontab', 'interval', 'date_last_run', 'summary',
          'created_by', 'is_periodic_display', 'is_periodic'
        ],
        columnsMeta: {
          actions: {
            has: false
          },
          name: {
            formatter: (row) => row.name
          },
          summary: {
            width: '130px',
            label: `${this.$t('Success')}/${this.$t('Total')}`,
            formatter: (row) => {
              return <div>
                <span class='text-primary'>{row.summary.success}</span>/
                <span>{row.summary.total}</span>
              </div>
            }
          },
          is_periodic_display: {
            width: '100px',
            label: this.$t('Periodic')
          },
          is_periodic: {
            width: '140px',
            label: `${this.$t('Enable')}/${this.$t('Disable')}`,
            formatter: SwitchFormatter,
            formatterArgs: {
              isDisplay(row) {
                return row.is_periodic
              },
              getPatchUrl(row) {
                return `/api/v1/audits/jobs/${row.id}/`
              },
              getPatchData(row) {
                return {
                  is_periodic: !row.is_periodic
                }
              },
              callback() {
                vm.$refs.ListPage.reloadTable()
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
