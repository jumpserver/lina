<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountGatherTaskExecutionList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/gather-account-executions/',
        columns: [
          'automation', 'account_gather_name', 'status', 'trigger', 'date_start',
          'date_finished', 'actions'
        ],
        columnsMeta: {
          automation: {
            label: this.$t('TaskID'),
            formatter: function(row) {
              return <span>{row.automation}</span>
            }
          },
          account_gather_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountGatherTaskDetail',
                params: { id: row.automation }
              })
            },
            id: ({ row }) => row.automation
          },
          timedelta: {
            label: this.$t('TimeDelta'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            },
            width: null
          },
          date_start: {
            width: null
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'log',
                  type: 'primary',
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('Detail'),
                  type: 'info',
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AccountGatherExecutionDetail', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        searchConfig: {
          options: [
            {
              label: this.$t('TaskID'),
              value: 'automation_id'
            },
            {
              label: this.$t('DisplayName'),
              value: 'automation__name'
            }
          ]
        },
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false
      }
    }
  },
  mounted() {
    const automation_id = this.$route.query.automation_id
    if (automation_id !== undefined) {
      this.tableConfig.url = `${this.tableConfig.url}?automation_id=${automation_id}`
    }
  }
}
</script>
