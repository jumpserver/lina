<template>
  <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { DateFormatter } from '@/components/TableFormatters'

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
        columns: [
          'instance_id',
          {
            prop: 'asset_display',
            label: this.$t('xpack.Asset')
          },
          {
            prop: 'asset_ip',
            label: this.$t('xpack.ip')
          },
          'region',
          {
            prop: 'status_display',
            label: this.$t('xpack.Cloud.Status')
          },
          {
            prop: 'date_sync',
            label: this.$t('xpack.Cloud.DateSync'),
            formatter: DateFormatter
          }
        ]
      }
    }
  },
  methods: {
    DeleteReleasedAssets() {
      this.$axios.delete(`/api/v1/xpack/cloud/sync-instance-tasks/${this.object.id}/released-assets/`).then(
        res => {
          this.$message.success(this.$t('common.deleteSuccessMsg'))
          this.$refs.GenericListTable.$refs.ListTable.reloadTable()
        }
      ).catch(() => {
        this.$message.error(this.$t('common.deleteErrorMsg'))
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
