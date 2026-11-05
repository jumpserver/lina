<template>
  <ul class="connection-details" :aria-label="$t('ConnectionDetails')">
    <li v-for="(row, index) in connections" :key="index">
      <el-row>
        <el-col :sm="12">
          {{ $t('ApplyLoginAsset') }}: {{ row.asset.name || row.asset.id || '-' }}
          <span v-if="row.asset.address">({{ row.asset.address }})</span>
        </el-col>
        <el-col :sm="12">{{ $t('ApplyLoginAccount') }}: {{ row.account || '-' }}</el-col>
        <el-col v-if="row.reason">
          {{ $t('ConnectionReason') }}:
          <span class="connection-reason"
            >{{ expanded[index] ? row.reason : previewReason(row.reason)
            }}<span v-if="!expanded[index] && isLongReason(row.reason)">…</span></span
          >
          <el-button
            v-if="isLongReason(row.reason)"
            link
            type="primary"
            :aria-expanded="Boolean(expanded[index])"
            @click="expanded[index] = !expanded[index]"
          >
            {{ $t(expanded[index] ? 'CollapseReason' : 'ExpandReason') }}
          </el-button>
        </el-col>
      </el-row>
    </li>
  </ul>
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
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 480px;
  overflow-y: auto;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.8;
}

.connection-details li + li {
  margin-top: 8px;
}

.connection-reason {
  white-space: pre-wrap;
}
</style>
