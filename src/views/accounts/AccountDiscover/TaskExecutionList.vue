<template>
  <div>
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'

import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountDiscoverTaskExecutionList',
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
      showTableUpdateDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      tableConfig: {
        url: '/api/v1/accounts/gather-account-executions/',
        columns: [
          'automation', 'account_gather_name', 'status', 'trigger',
          'date_start', 'date_finished', 'actions'
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
                name: 'AccountDiscoverTaskDetail',
                params: { id: row.automation },
                query: { type: 'pam' }
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
                  callback: ({ row }) => {
                    this.handleDetailCallback(row)
                    return this.$router.push({ name: 'AccountDiscoverExecutionDetail', params: { id: row.id }})
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm('accounts.view_gatheraccountsexecution'),
                  callback: function({ row }) {
                    window.open(`/api/v1/accounts/gather-account-executions/${row.id}/report/`)
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
  },
  methods: {
    handleDetailCallback(row) {
      this.$route.params.id = row.id

      this.$route.query.type = 'pam'

      this.currentTemplate = 'AccountDiscoverExecutionDetail'
      this.showTableUpdateDrawer = true
    }
  }
}
</script>
