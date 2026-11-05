<template>
  <el-table
    :data="rows"
    :empty-text="$t('TicketAdjustmentNoChanges')"
    :aria-label="$t('TicketAdjustmentDiff')"
    row-key="name"
    :max-height="420"
    class="adjustment-diff"
  >
    <el-table-column prop="label" :label="$t('TicketAdjustmentField')" min-width="120" />
    <el-table-column :label="$t('TicketAdjustmentBefore')" min-width="240">
      <template #default="{ row }"
        ><div class="adjustment-value">{{ row.before }}</div></template
      >
    </el-table-column>
    <el-table-column :label="$t('TicketAdjustmentAfter')" min-width="240">
      <template #default="{ row }"
        ><div class="adjustment-value">{{ row.after }}</div></template
      >
    </el-table-column>
  </el-table>
</template>

<script>
import { isEqual } from 'lodash'
import { useDateTime } from '@/composables/useDateTime'
import { AccountLabelMapper } from '@/views/perms/const'

// Bit values follow the permission actions stored in adjustment events.
const actions = ['connect', 'upload', 'download', 'copy', 'paste', 'delete', 'share']
const labels = {
  apply_assets: 'Asset',
  apply_nodes: 'Node',
  apply_users: 'TicketAuthorizedUsers',
  apply_accounts: 'Account',
  apply_actions: 'Action',
  apply_date_start: 'DateStart',
  apply_date_expired: 'DateExpired',
  apply_expire_soon_notice_minutes: 'ExpireSoonNoticeMinutes',
  asset: 'Asset',
  accounts: 'Account',
  duration: 'WFFieldValidity',
  resource_description: 'TicketResourceDescription'
}

export default {
  name: 'TicketAdjustmentDiff',
  props: {
    change: { type: Object, required: true },
    items: { type: Array, default: () => [] },
    snapshot: { type: Object, default: () => ({}) }
  },
  setup: useDateTime,
  computed: {
    rows() {
      const before = this.change.before || {}
      const after = this.change.after || {}
      return [...new Set([...Object.keys(before), ...Object.keys(after)])]
        .filter(
          (name) => !isEqual(this.normalize(name, before[name]), this.normalize(name, after[name]))
        )
        .map((name) => ({
          name,
          label: Object.hasOwn(labels, name)
            ? this.$t(labels[name])
            : this.items.find((item) => item.name === name)?.label || name,
          before: this.formatValue(name, before[name]),
          after: this.formatValue(name, after[name])
        }))
    }
  },
  methods: {
    actionValues(value) {
      if (typeof value === 'number') {
        const selected = actions.filter((_, index) => value & (2 ** index))
        const unknown = value & ~127
        return unknown ? [...selected, String(unknown)] : selected
      }
      const selected = (Array.isArray(value) ? value : [value]).map((item) => item?.value ?? item)
      return selected.includes('all')
        ? [...actions, ...selected.filter((item) => item !== 'all' && !actions.includes(item))]
        : selected
    },
    normalize(name, value) {
      if (name === 'apply_actions' && value != null) value = this.actionValues(value)
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) return null
      if (Array.isArray(value)) return [...value].sort((a, b) => String(a).localeCompare(String(b)))
      if (
        ['apply_date_start', 'apply_date_expired'].includes(name) &&
        !Number.isNaN(Date.parse(value))
      ) {
        return Date.parse(value)
      }
      return value
    },
    formatValue(name, value) {
      if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
        return name === 'apply_expire_soon_notice_minutes' ? this.$t('Disabled') : '-'
      }
      if (name === 'apply_actions') {
        const selected = this.actionValues(value)
        if (
          selected.length === actions.length &&
          actions.every((action) => selected.includes(action))
        ) {
          return this.$t('All')
        }
        return (
          selected
            .map((action) =>
              actions.includes(action)
                ? this.$t(action[0].toUpperCase() + action.slice(1))
                : String(action)
            )
            .join('、') || '-'
        )
      }
      if (Array.isArray(value)) return value.map((item) => this.formatValue(name, item)).join('\n')
      if (['apply_date_start', 'apply_date_expired'].includes(name)) {
        return Number.isNaN(Date.parse(value)) ? String(value) : this.toSafeLocalDateStr(value)
      }
      if (name === 'apply_expire_soon_notice_minutes') return `${value} ${this.$t('Minutes')}`
      if (name === 'apply_accounts') {
        if (Object.hasOwn(AccountLabelMapper, value)) return AccountLabelMapper[value]
        if (typeof value === 'string' && value.startsWith('!')) {
          return `${this.$t('ExcludeAccount')}: ${value.slice(1)}`
        }
      }
      const resources = ['asset', 'apply_assets'].includes(name)
        ? this.snapshot.assets
        : name === 'apply_nodes'
          ? this.snapshot.nodes
          : []
      const resource = resources?.find((item) => item.id === value)
      if (resource) {
        return resource.address
          ? `${resource.name} (${resource.address})`
          : resource.full_value || resource.name || String(value)
      }
      if (typeof value === 'object') {
        return value.label || value.name || value.value || JSON.stringify(value)
      }
      return String(value)
    }
  }
}
</script>

<style scoped>
.adjustment-diff {
  --el-table-header-bg-color: var(--el-fill-color-light);
  font-size: 14px;
}
.adjustment-diff :deep(.el-table__cell) {
  padding: 14px 0;
  vertical-align: top;
}
.adjustment-diff :deep(th.el-table__cell) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.adjustment-diff :deep(.cell) {
  padding: 0 16px;
  overflow-wrap: anywhere;
}
.adjustment-value {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
