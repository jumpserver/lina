<template>
  <div class="clipboard-policy">
    <el-checkbox
      v-for="item in items"
      :key="item.key"
      :value="can[item.key] && policy[item.key]"
      :disabled="!can[item.key]"
      @change="val => onToggle(item.key, val)"
    >{{ $t(item.label) }}</el-checkbox>
    <div
      v-for="item in items.filter(i => i.limit)"
      v-show="can[item.key] && policy[item.key]"
      :key="item.limit"
      class="clipboard-policy-limit"
    >
      <span>{{ $t(item.limitLabel) }}</span>
      <el-input-number
        v-model="policy[item.limit]"
        :min="0"
        size="mini"
        controls-position="right"
        @change="emitChange"
      />
      <el-tooltip :content="$t('ZeroMeansUnlimited')" placement="top">
        <i class="fa fa-question-circle-o" />
      </el-tooltip>
    </div>
  </div>
</template>

<script>
// Each clipboard item is gated by a clipboard action, by data direction:
//   server -> client (copy out): file_download / text_copy  ↔ copy
//   client -> server (paste in): file_upload   / text_paste ↔ paste
const ITEMS = [
  { key: 'file_upload', label: 'FileUpload', action: 'paste' },
  { key: 'file_download', label: 'FileDownload', action: 'copy' },
  { key: 'text_copy', label: 'TextCopy', action: 'copy', limit: 'text_copy_max_length', limitLabel: 'TextCopyMaxLength' },
  { key: 'text_paste', label: 'TextPaste', action: 'paste', limit: 'text_paste_max_length', limitLabel: 'TextPasteMaxLength' }
]

export const defaultClipboardPolicy = () => ({
  file_upload: true, file_download: true, text_copy: true, text_paste: true,
  text_copy_max_length: 0, text_paste_max_length: 0
})

const actionValues = actions => (Array.isArray(actions) ? actions.map(i => (i && i.value ? i.value : i)) : [])

// Persist only what is enforceable given the granted actions (backend ANDs too).
export const applyActionsToClipboardPolicy = (value, actions) => {
  const policy = { ...defaultClipboardPolicy(), ...(value || {}) }
  const acts = actionValues(actions)
  ITEMS.forEach(i => { if (!acts.includes(i.action)) policy[i.key] = false })
  return policy
}

export default {
  name: 'ClipboardPolicy',
  props: {
    value: { type: Object, default: () => ({}) },
    actions: { type: Array, default: () => [] }
  },
  data() {
    return { items: ITEMS, policy: { ...defaultClipboardPolicy(), ...this.value } }
  },
  computed: {
    can() {
      const acts = actionValues(this.actions)
      return ITEMS.reduce((m, i) => ({ ...m, [i.key]: acts.includes(i.action) }), {})
    }
  },
  watch: {
    value(v) { this.policy = { ...defaultClipboardPolicy(), ...v } }
  },
  mounted() { this.emitChange() },
  methods: {
    onToggle(key, val) { this.policy[key] = val; this.emitChange() },
    emitChange() { this.$emit('input', { ...this.policy }) }
  }
}
</script>

<style lang="scss" scoped>
.clipboard-policy {
  padding: 5px 0;

  .clipboard-policy-limit {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 13px;

    i { color: #8492a6; cursor: help; }
    ::v-deep .el-input-number--mini { width: 120px; }
  }
}
</style>
