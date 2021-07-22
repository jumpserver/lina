<template>
  <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { ActionsFormatter, DateFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'HistoryList',
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
        hasSearch: true
      },
      tableConfig: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/history/`,
        columns: [
          {
            prop: 'summary.new',
            label: this.$t('xpack.Cloud.NewCount')
          },
          {
            prop: 'summary.unsync',
            label: this.$t('xpack.Cloud.UnSyncCount')
          },
          {
            prop: 'summary.sync',
            label: this.$t('xpack.Cloud.SyncedCount')
          },
          {
            prop: 'summary.released',
            label: this.$t('xpack.Cloud.ReleasedCount')
          },
          {
            prop: 'status_display',
            label: this.$t('xpack.Cloud.Status')
          },
          {
            prop: 'date_sync',
            label: this.$t('xpack.Cloud.DateSync'),
            formatter: DateFormatter
          },
          {
            prop: 'id',
            label: this.$t('common.Action'),
            align: 'center',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              moreActionsTitle: this.$t('xpack.Cloud.Log'),
              hasClone: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
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
