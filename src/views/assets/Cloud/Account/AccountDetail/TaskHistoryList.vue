<template>
  <div>
    <GenericListTable
      ref="GenericListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <Dialog
      v-if="executionItemDialog.visible"
      v-model:visible="executionItemDialog.visible"
      :title="executionItemDialog.title"
      :width="executionItemDialog.width"
      :show-buttons="false"
      class="cloud-execution-dialog"
      top="5vh"
    >
      <el-descriptions v-if="selectedExecution" :column="3" border class="execution-summary">
        <el-descriptions-item :label="$t('TriggerMode')">
          {{ formatTrigger(selectedExecution.trigger) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Scope')">
          {{ formatScope(selectedExecution.scope) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Duration')">
          {{ formatDuration(selectedExecution.duration) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('StartTime')">
          {{ formatDate(selectedExecution.date_start) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('EndTime')">
          {{ formatDate(selectedExecution.date_finished) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Status')">
          {{ statusLabel(selectedExecution.status) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-alert
        v-if="selectedExecution?.region_summary?.failed?.length"
        :closable="false"
        :title="$t('PartialRegionResult')"
        type="warning"
        class="region-summary"
      >
        <div>
          {{ $t('SuccessfulRegions') }}:
          {{ selectedExecution.region_summary.succeeded.join(', ') || '-' }}
        </div>
        <div v-for="item in selectedExecution.region_summary.failed" :key="item.region">
          {{ item.region }}: {{ formatBusinessReason(item, item.message) }}
        </div>
      </el-alert>
      <GenericListTable
        class="execution-item-table"
        :table-metadata-provider="getExecutionItemMetadata"
        :header-actions="executionItemDialog.headerActions"
        :table-config="executionItemDialog.tableConfig"
      />
    </Dialog>
  </div>
</template>

<script lang="jsx">
import GenericListTable from '@/layout/components/GenericListTable/index'
import Dialog from '@/components/Dialog/index.vue'
import { ActionsFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms/index'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { CLOUD_SYNC_ACTIONS } from '@/views/assets/Cloud/syncStatus'
export default {
  name: 'TaskHistoryList',
  components: {
    GenericListTable,
    Dialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      selectedExecution: null,
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
      executionItemDialog: {
        visible: false,
        title: this.$t('ExecutionItems'),
        width: '80%',
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
          url: '',
          hasSelection: false,
          tableAttrs: {
            height: 'min(420px, 45vh)',
            rowKey: 'id',
            stripe: false,
            highlightCurrentRow: false
          },
          columnsShow: {
            min: [],
            default: [
              'action',
              'asset_display',
              'external_id',
              'region',
              'changed_fields',
              'reason_display',
              'error_display',
              'date_created'
            ]
          },
          columns: [
            {
              prop: 'action',
              label: this.$t('Action'),
              formatter: (row) => {
                const action = CLOUD_SYNC_ACTIONS[row.action] || CLOUD_SYNC_ACTIONS.fail
                return (
                  <el-tag type={action.type} size="small">
                    {this.$t(action.label)}
                  </el-tag>
                )
              }
            },
            {
              prop: 'asset_display',
              label: this.$t('Asset')
            },
            {
              prop: 'external_id',
              label: this.$t('ExternalID')
            },
            {
              prop: 'region',
              label: this.$t('Region')
            },
            {
              prop: 'changed_fields',
              label: this.$t('FieldDiff'),
              formatter: (row) => this.formatDiff(row)
            },
            {
              prop: 'reason_display',
              label: this.$t('Reason'),
              formatter: (row) => this.formatBusinessReason(row.reason, row.reason_display)
            },
            {
              prop: 'error_display',
              label: this.$t('Error'),
              formatter: (row) => this.formatBusinessReason(row.error, row.error_display, '-')
            },
            {
              prop: 'date_created',
              label: this.$t('DateCreated'),
              formatter: DateFormatter
            },
            { prop: 'id', label: 'ID' },
            { prop: 'actions', has: false }
          ]
        }
      },
      tableConfig: {
        url: `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task?.id}/history/`,
        columns: [
          {
            prop: 'trigger',
            label: this.$t('TriggerMode'),
            formatter: (row) => this.formatTrigger(row.trigger)
          },
          {
            prop: 'scope',
            label: this.$t('Scope'),
            formatter: (row) => this.formatScope(row.scope)
          },
          {
            prop: 'summary.new',
            label: this.$t('NewCount')
          },
          {
            prop: 'summary.updated',
            label: this.$t('UpdatedCount')
          },
          {
            prop: 'summary.nochange',
            label: this.$t('NoChangeCount')
          },
          {
            prop: 'summary.stale',
            label: this.$t('PendingReleaseCount')
          },
          {
            prop: 'summary.failed',
            label: this.$t('FailedCount')
          },
          {
            prop: 'summary.skip',
            label: this.$t('SkipCount')
          },
          {
            prop: 'summary.conflict',
            label: this.$t('ConflictCount')
          },
          {
            prop: 'summary.released',
            label: this.$t('ReleasedCount')
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            formatter: (row) => {
              const statusMap = {
                0: { label: 'Failed', type: 'danger' },
                1: { label: 'Success', type: 'success' },
                2: { label: 'Pending', type: 'info' },
                3: { label: 'Running', type: 'primary' },
                4: { label: 'Partial', type: 'warning' },
                5: { label: 'Cancelled', type: 'info' },
                6: { label: 'Timeout', type: 'danger' }
              }
              const status = statusMap[row.status] || statusMap[0]
              return (
                <el-tag type={status.type} size="small">
                  {this.$t(status.label)}
                </el-tag>
              )
            }
          },
          {
            prop: 'date_start',
            label: this.$t('StartTime'),
            formatter: DateFormatter
          },
          {
            prop: 'date_finished',
            label: this.$t('EndTime'),
            formatter: DateFormatter
          },
          {
            prop: 'duration',
            label: this.$t('Duration'),
            formatter: (row) => this.formatDuration(row.duration)
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            align: 'center',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              // can set function(row, value)
              hasDelete: false,
              // can set function(row, value)
              moreActionsTitle: this.$t('Log'),
              hasClone: false,
              extraActions: [
                {
                  name: 'Details',
                  title: this.$t('Details'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.showExecutionItems(row)
                  }
                },
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: function (val) {
                    openTaskPage(val.row.id)
                  }
                }
              ]
            }
          }
        ]
      }
    }
  },
  methods: {
    async getExecutionItemMetadata(url) {
      const meta = await this.$store.dispatch('common/getUrlMeta', { url })
      const labels = {
        action: this.$t('Action'),
        region: this.$t('Region'),
        external_id: this.$t('ExternalID'),
        resource_type: this.$t('ResourceType')
      }
      // Keep the API filter values/operators and translate only their display labels.
      const filters = Object.fromEntries(
        Object.entries(meta.filters || {}).map(([name, field]) => [
          name,
          {
            ...field,
            label: labels[name] || field.label,
            ...(name === 'action' &&
              field.choices && {
                choices: field.choices.map((choice) => ({
                  ...choice,
                  label: CLOUD_SYNC_ACTIONS[choice.value]
                    ? this.$t(CLOUD_SYNC_ACTIONS[choice.value].label)
                    : choice.label
                }))
              })
          }
        ])
      )
      return { ...meta, filters }
    },
    formatTrigger(trigger) {
      const labels = {
        manual: 'SyncManual',
        timing: 'SyncTiming'
      }
      const key = labels[trigger?.value]
      return key ? this.$t(key) : trigger?.label || trigger?.value || '-'
    },
    formatBusinessReason(reason, fallback = '', emptyFallback = null) {
      const labels = {
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
      }
      const key = labels[reason?.code]
      if (key) return this.$t(key)
      if (reason?.message) return reason.message
      if (fallback && fallback !== 'No additional details') return fallback
      return emptyFallback === null ? this.$t('NoAdditionalDetails') : emptyFallback
    },
    formatDate(value) {
      return toSafeLocalDateStr(value)
    },
    formatDuration(seconds) {
      if (!seconds) return '-'
      if (seconds < 60) return `${seconds.toFixed(1)}s`
      return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
    },
    formatScope(scope) {
      if (!scope) return '-'
      const regions = scope.regions?.join(', ') || '-'
      return `${scope.provider || '-'} · ${regions}`
    },
    statusLabel(status) {
      const labels = {
        0: 'Failed',
        1: 'Success',
        2: 'Pending',
        3: 'Running',
        4: 'Partial',
        5: 'Cancelled',
        6: 'Timeout'
      }
      return this.$t(labels[status] || 'Unknown')
    },
    stringifyDiffValue(value) {
      if (value === null || value === undefined || value === '') return '-'
      return typeof value === 'object' ? JSON.stringify(value) : String(value)
    },
    formatDiff(row) {
      if (!row.changed_fields?.length) return '-'
      return (
        <div class="field-diff">
          {row.changed_fields.map((field) => (
            <div key={field}>
              <strong>{field}</strong>: {this.stringifyDiffValue(row.before?.[field])}
              {' → '}
              {this.stringifyDiffValue(row.after?.[field])}
            </div>
          ))}
        </div>
      )
    },
    showExecutionItems(row) {
      this.selectedExecution = row
      this.executionItemDialog.title = `${this.$t('ExecutionItems')} - ${row.id}`
      this.executionItemDialog.tableConfig.url = `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task?.id}/history/${row.id}/items/`
      this.executionItemDialog.visible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.execution-summary,
.region-summary {
  margin-bottom: 16px;
}

.execution-item-table {
  margin-bottom: 0;
}
</style>

<style lang="scss">
.el-dialog.cloud-execution-dialog .el-dialog__body {
  box-sizing: border-box;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
}
</style>
