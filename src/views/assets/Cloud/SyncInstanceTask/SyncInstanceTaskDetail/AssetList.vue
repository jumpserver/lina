<template>
  <GenericListTable ref="GenericListTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { DateFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AssetList',
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
        hasLeftActions: true,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasSearch: true,
        hasCreate: false,
        moreActionsTitle: this.$t('common.MoreActions'),
        moreActionsType: 'primary',
        searchConfig: {
          getUrlQuery: false
        },
        extraMoreActions: [
          {
            name: this.$t('xpack.Cloud.DeleteReleasedAssets'),
            title: this.$t('xpack.Cloud.DeleteReleasedAssets'),
            type: 'primary',
            can: true,
            callback: this.DeleteReleasedAssets.bind(this)
          }
        ]
      },
      tableConfig: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/instances/`,
        hasSelection: false,
        columns: [
          'instance_id',
          {
            prop: 'asset_ip',
            label: this.$t('xpack.ip')
          },
          'region',
          {
            prop: 'status',
            label: this.$t('xpack.Cloud.Status'),
            formatter: row => {
              const status = {
                0: this.$t('xpack.Cloud.UnSyncCount'),
                1: this.$t('xpack.Cloud.NewSyncCount'),
                2: this.$t('xpack.Cloud.SyncedCount'),
                3: this.$t('xpack.Cloud.ReleasedCount')
              }
              return <el-tag type='primary' size='mini'>{status[row.status]}</el-tag>
            }
          },
          {
            prop: 'date_sync',
            label: this.$t('xpack.Cloud.DateSync'),
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
  methods: {
    DeleteReleasedAssets() {
      this.$axios.delete(`/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/released-assets/`).then(
        res => {
          this.$message.success(this.$tc('common.deleteSuccessMsg'))
          this.$refs.GenericListTable.$refs.ListTable.reloadTable()
        }
      ).catch(() => {
        this.$message.error(this.$tc('common.deleteErrorMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
