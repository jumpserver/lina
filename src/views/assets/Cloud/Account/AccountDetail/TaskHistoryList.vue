<template>
  <GenericListTable ref="GenericListTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { ActionsFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'TaskHistoryList',
  components: { GenericListTable },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasSearch: true,
        searchConfig: {
          getUrlQuery: false
        }
      },
      tableConfig: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task?.id}/history/`,
        columns: [
          {
            prop: 'summary.new',
            label: this.$t('NewCount')
          },
          {
            prop: 'summary.unsync',
            label: this.$t('UnSyncCount')
          },
          {
            prop: 'summary.sync',
            label: this.$t('SyncedCount')
          },
          {
            prop: 'summary.released',
            label: this.$t('ReleasedCount')
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            formatter: row => {
              if (row.status === 1) {
                return <el-tag type='primary' size='mini'>{this.$t('Success')}</el-tag>
              } else {
                return <el-tag type='danger' size='mini'>{this.$t('Failed')}</el-tag>
              }
            }
          },
          {
            prop: 'date_sync',
            label: this.$t('DateSync'),
            formatter: DateFormatter
          },
          {
            prop: 'trigger',
            label: this.$t('TriggerMode'),
            formatter: row => {
              return row.trigger.label
            }
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            align: 'center',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              moreActionsTitle: this.$t('Log'),
              hasClone: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: function(val) {
                    openTaskPage(val.row.id)
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
