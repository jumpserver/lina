<template>
  <div>
    <el-alert :closable="false" :title="reviewPolicy" :type="reviewPolicyType" show-icon />
    <GenericListTable
      ref="PendingReviewTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      @selection-change="selectedRows = $event"
      @loaded="selectedRows = []"
    >
      <template #search-after>
        <el-button
          v-if="canDeleteAssets"
          :disabled="!selectedRows.length"
          :loading="deletingSelectedAssets"
          class="delete-selected-assets"
          plain
          size="small"
          type="danger"
          @click="deleteSelectedAssets"
        >
          {{ $t('DeleteSelected') }} ({{ selectedRows.length }})
        </el-button>
      </template>
    </GenericListTable>
  </div>
</template>

<script lang="jsx">
import GenericListTable from '@/layout/components/GenericListTable/index'
import { getErrorResponseMsg } from '@/utils/common'
import { DateFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

const REASON_I18N_KEYS = Object.freeze({
  cloud_confirmed_missing: 'CloudConfirmedMissing',
  authoritative_missing: 'CloudConfirmedMissing',
  strategy_not_matched: 'CloudStrategyNotMatched',
  region_removed: 'CloudRegionRemoved',
  binding_conflict: 'CloudBindingConflict',
  not_selected: 'CloudResourceNotSelected',
  preview_only: 'CloudResourcePreviewOnly',
  asset_update_disabled: 'CloudAssetUpdateDisabled',
  timeout: 'CloudRegionScanTimeout',
  pagination_incomplete: 'CloudPaginationIncomplete',
  invalid_result: 'CloudInvalidScanResult',
  provider_error: 'CloudProviderScanFailed'
})

export default {
  name: 'PendingReleaseBindingList',
  components: { GenericListTable },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      deletingSelectedAssets: false,
      selectedRows: [],
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: true,
        hasColumnSetting: true,
        hasRefresh: true,
        hasSearch: true,
        exportOptions: {
          canExportSelected: true
        },
        searchConfig: {
          getUrlQuery: false,
          excludeFields: ['id', 'account', 'account_name', 'provider', 'resource_type', 'status'],
          fieldLabels: {
            region: this.$t('Region'),
            external_id: this.$t('ExternalID')
          }
        }
      },
      tableConfig: {
        url: `/api/v1/xpack/cloud/cloud-asset-bindings/stale/?account=${this.object.id}`,
        hasSelection: true,
        columns: [
          {
            prop: 'asset_display',
            label: this.$t('Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: ({ row }) => Boolean(row.asset),
              getTitle: ({ row }) => row.asset_display || this.$t('UnboundLocalAsset'),
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset }
              })
            }
          },
          { prop: 'asset_address', label: this.$t('Address') },
          { prop: 'region', label: this.$t('Region') },
          { prop: 'external_id', label: this.$t('ExternalID') },
          {
            prop: 'reason_display',
            label: this.$t('PendingReleaseReason'),
            formatter: this.formatReason
          },
          {
            prop: 'missing_count',
            label: this.$t('MissingCount')
          },
          {
            prop: 'stale_since',
            label: this.$t('FirstMissingAt'),
            formatter: DateFormatter
          },
          {
            prop: 'last_seen_at',
            label: this.$t('LastSeenAt'),
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
    canDeleteAssets() {
      return this.$hasPerm('assets.delete_asset') && this.$hasPerm('xpack.view_cloudaccount')
    },
    reviewPolicy() {
      const key = this.object.task?.release_assets
        ? 'AutoReleasePolicyDescription'
        : 'ManualReviewPolicyDescription'
      return this.$t(key)
    },
    reviewPolicyType() {
      return this.object.task?.release_assets ? 'warning' : 'info'
    }
  },
  methods: {
    deleteSelectedAssets() {
      const ids = this.selectedRows.map((row) => row.id)
      const account = this.object.id
      if (!ids.length || !this.canDeleteAssets || this.deletingSelectedAssets) return
      this.$alert(
        this.$t('DeleteSelectedCloudAssetsConfirm', {
          account: this.object.name || '-',
          count: ids.length
        }),
        this.$t('DeleteSelected'),
        {
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          confirmButtonText: this.$t('DeleteSelected'),
          showCancelButton: true,
          beforeClose: async (action, instance, done) => {
            if (action !== 'confirm') return done()
            this.deletingSelectedAssets = true
            instance.confirmButtonLoading = true
            try {
              await this.$axios.delete('/api/v1/xpack/cloud/cloud-asset-bindings/stale/', {
                data: { account, ids },
                disableFlashErrorMsg: true
              })
              done()
              this.selectedRows = []
              this.$refs.PendingReviewTable?.reloadTable()
              this.$message.success(this.$t('BulkDeleteSuccessMsg'))
            } catch (error) {
              this.$message.error(this.$t('BulkDeleteErrorMsg') + getErrorResponseMsg(error))
            } finally {
              this.deletingSelectedAssets = false
              instance.confirmButtonLoading = false
            }
          }
        }
      ).catch(() => {})
    },
    formatReason(row) {
      const reasonCode = row.stale_reason?.code
      const key = REASON_I18N_KEYS[reasonCode]
      return key ? this.$t(key) : row.reason_display || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.delete-selected-assets {
  flex: 0 0 auto;
  height: 30px;
  margin: 0;
}
</style>
