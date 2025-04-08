<template>
  <GenericListTable ref="GenericListTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { DateFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'TaskSyncAssetList',
  components: { GenericListTable },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      headerActions: {
        hasLeftActions: true,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasSearch: true,
        hasCreate: false,
        moreActionsTitle: this.$t('MoreActions'),
        moreActionsType: 'primary',
        searchConfig: {
          getUrlQuery: false
        },
        extraMoreActions: [
          {
            name: this.$t('DeleteReleasedAssets'),
            title: this.$t('DeleteReleasedAssets'),
            type: 'primary',
            can: true,
            callback: this.DeleteReleasedAssets.bind(this)
          }
        ]
      },
      tableConfig: {
        url: '',
        hasSelection: false,
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
            formatter: row => {
              const status = {
                0: this.$t('UnSyncCount'),
                1: this.$t('NewSyncCount'),
                2: this.$t('SyncedCount'),
                3: this.$t('ReleasedCount')
              }
              return <el-tag type='primary' size='mini'>{status[row.status]}</el-tag>
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
      const baseUrl = '/api/v1/xpack/cloud/sync-instance-tasks/instances/'
      return this.object ? `${baseUrl}?task_id=${this.object.task.id}` : baseUrl
    }
  },
  mounted() {
    this.tableConfig.url = this.dynamicUrl
  },
  methods: {
    DeleteReleasedAssets() {
      const baseUrl = '/api/v1/xpack/cloud/sync-instance-tasks/released-assets/'
      const url = this.object ? `${baseUrl}?task_id=${this.object.task.id}` : baseUrl
      this.$axios.delete(url).then(
        res => {
          this.$message.success(this.$tc('DeleteSuccessMsg'))
          this.$refs.GenericListTable.$refs.ListTable.reloadTable()
        }
      ).catch(() => {
        this.$message.error(this.$tc('DeleteErrorMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
