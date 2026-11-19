<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import GenericListTable from '@/layout/components/GenericListTable/index'
import { DateFormatter } from '@/components/Table/TableFormatters'
export default {
  name: 'TaskSyncAssetList',
  components: {
    GenericListTable
  },
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
        hasExport: true,
        hasSearch: true,
        hasCreate: false,
        exportOptions: {
          canExportSelected: true
        },
        searchConfig: {
          getUrlQuery: false
        }
      },
      tableConfig: {
        url: '',
        hasSelection: true,
        columns: [
          'instance_id',
          {
            prop: 'asset_ip',
            label: this.$t('IP')
          },
          {
            prop: 'asset_display',
            label: this.$t('Asset')
          },
          'region',
          {
            prop: 'status',
            label: this.$t('Status'),
            formatter: (row) => {
              const status = {
                0: this.$t('UnSyncCount'),
                1: this.$t('NewSyncCount'),
                2: this.$t('SyncedCount'),
                3: this.$t('ReleasedCount')
              }
              return (
                <el-tag type="primary" size="small">
                  {status[row.status]}
                </el-tag>
              )
            }
          },
          {
            prop: 'date_sync',
            label: this.$t('DateSync'),
            formatter: DateFormatter
          },
          {
            prop: 'actions',
            has: false
          }
        ]
      }
    }
  },
  computed: {
    dynamicUrl() {
      const category =
        this.$context?.get?.('category') ||
        this.object?.category ||
        this.$route.query.category ||
        'host'
      const baseUrl = `/api/v1/xpack/cloud/sync-instance-tasks/instances/?category=${category}`
      const taskId = this.object?.task?.id
      return taskId ? `${baseUrl}&task_id=${taskId}` : baseUrl
    }
  },
  mounted() {
    this.tableConfig.url = this.dynamicUrl
  }
}
</script>

<style lang="scss" scoped></style>
