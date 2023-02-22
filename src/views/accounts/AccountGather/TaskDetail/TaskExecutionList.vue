<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'

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
        columns: ['trigger', 'date_start', 'date_finished', 'status', 'actions'],
        columnsMeta: {
          timedelta: {
            label: this.$t('ops.timeDelta'),
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
                  title: this.$t('accounts.AccountChangeSecret.Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('accounts.AccountChangeSecret.Detail'),
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
              label: this.$t('accounts.TaskID'),
              value: 'automation_id'
            }
          ]
        },
        hasSearch: true,
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: true,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
