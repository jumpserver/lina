<template>
  <el-table
    :data="connections"
    :aria-label="$t('ConnectionDetails')"
    border
    class="connection-details"
    :max-height="480"
  >
    <el-table-column :label="$t('Asset')" min-width="180">
      <template #default="{ row }">
        <div class="connection-asset">{{ row.asset.name || row.asset.id || '-' }}</div>
        <div v-if="row.asset.address" class="connection-address">{{ row.asset.address }}</div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('Account')" prop="account" min-width="120" />
    <el-table-column :label="$t('ConnectionReason')" min-width="240">
      <template #default="{ row, $index }">
        <div class="connection-reason">
          {{ expanded[$index] ? row.reason : previewReason(row.reason)
          }}<span v-if="!expanded[$index] && isLongReason(row.reason)">…</span>
        </div>
        <el-button
          v-if="isLongReason(row.reason)"
          link
          type="primary"
          :aria-expanded="Boolean(expanded[$index])"
          @click="expanded[$index] = !expanded[$index]"
        >
          {{ $t(expanded[$index] ? 'CollapseReason' : 'ExpandReason') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'LoginAssetConnections',
  props: {
    connections: { type: Array, default: () => [] }
  },
  data() {
    return { expanded: {} }
  },
  watch: {
    connections() {
      this.expanded = {}
    }
  },
  methods: {
    previewReason(reason) {
      return reason
        ? Array.from(reason.split('\n').slice(0, 3).join('\n')).slice(0, 120).join('')
        : '-'
    },
    isLongReason(reason) {
      return Boolean(reason && this.previewReason(reason) !== reason)
    }
  }
}
</script>

<style scoped>
.connection-details {
  width: 100%;
}

.connection-details :deep(.cell) {
  overflow-wrap: anywhere;
  word-break: normal;
}

.connection-details :deep(td) {
  vertical-align: top;
}

.connection-address {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.connection-reason {
  white-space: pre-wrap;
}
</style>
