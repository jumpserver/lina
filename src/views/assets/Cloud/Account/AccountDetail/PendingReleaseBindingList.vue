<template>
  <div class="pending-review-list">
    <el-alert
      :closable="false"
      :title="reviewPolicy"
      :type="reviewPolicyType"
      class="policy-alert"
      show-icon
    />
    <div class="account-scope-actions">
      <span class="selection-hint">{{ $t('CloudReviewSelectionExportOnly') }}</span>
      <el-button
        :disabled="!taskId"
        :loading="deletingReleasedAssets"
        plain
        type="danger"
        @click="deleteReleasedAssets"
      >
        {{ $t('DeleteAllReleasedAssetsForAccount') }}
      </el-button>
    </div>
    <GenericListTable
      ref="PendingReviewTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
  </div>
</template>

<script lang="jsx">
import GenericListTable from '@/layout/components/GenericListTable/index'
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
      deletingReleasedAssets: false,
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: true,
        hasColumnSetting: false,
        hasRefresh: true,
        hasSearch: true,
        exportOptions: {
          canExportSelected: true
        },
        searchConfig: { getUrlQuery: false }
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
    taskId() {
      return this.object.task?.id || ''
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
    async deleteReleasedAssets() {
      if (!this.taskId) {
        this.$message.error(this.$t('CloudSyncTaskUnavailable'))
        return
      }
      try {
        await this.$confirm(
          this.$t('DeleteAllReleasedAssetsForAccountConfirm', {
            account: this.object.name || '-'
          }),
          this.$t('DeleteAllReleasedAssetsForAccount'),
          {
            confirmButtonText: this.$t('DeleteAllReleasedAssetsForAccount'),
            cancelButtonText: this.$t('Cancel'),
            type: 'warning'
          }
        )
      } catch {
        return
      }

      const url =
        '/api/v1/xpack/cloud/sync-instance-tasks/released-assets/' +
        `?task_id=${encodeURIComponent(this.taskId)}`
      this.deletingReleasedAssets = true
      try {
        await this.$axios.delete(url)
        this.$message.success(this.$t('DeleteAllReleasedAssetsForAccountSuccess'))
        this.$refs.PendingReviewTable?.reloadTable()
      } catch {
        this.$message.error(this.$t('DeleteAllReleasedAssetsForAccountFailed'))
      } finally {
        this.deletingReleasedAssets = false
      }
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
.policy-alert {
  margin-bottom: 8px;
}

.account-scope-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.selection-hint {
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .account-scope-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
