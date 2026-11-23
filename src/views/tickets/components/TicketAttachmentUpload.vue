<template>
  <div
    class="ticket-attachment-upload"
    tabindex="0"
    role="group"
    :aria-label="$t('Attachments')"
    @dragover.prevent
    @drop.prevent="addFiles($event.dataTransfer.files)"
    @paste="pasteFiles"
  >
    <div class="attachment-actions">
      <input
        ref="input"
        type="file"
        :accept="attachmentAccept"
        multiple
        hidden
        @change="selectFiles"
      />
      <el-button type="primary" plain :disabled="disabled" @click="$refs.input.click()">
        <el-icon aria-hidden="true"><Upload /></el-icon>
        <span>{{ $t('SelectFile') }}</span>
      </el-button>
      <span class="attachment-hint">{{ $t('TicketAttachmentDrop') }}</span>
    </div>
    <ul v-if="modelValue.length" class="attachment-list">
      <li v-for="(file, index) in modelValue" :key="index">
        <el-icon class="attachment-icon" aria-hidden="true"><Document /></el-icon>
        <span class="attachment-name">{{ file.name }}</span>
        <span class="attachment-size">{{ formatFileSize(file.size) }}</span>
        <el-button
          link
          type="danger"
          :disabled="disabled"
          :aria-label="$t('Remove') + ' ' + file.name"
          @click="remove(index)"
        >
          {{ $t('Remove') }}
        </el-button>
      </li>
    </ul>
    <div class="attachment-help">
      <p>{{ $t('TicketAttachmentHelp') }}</p>
      <p>{{ $t('TicketAttachmentRetention', { days: retentionDays }) }}</p>
    </div>
  </div>
</template>

<script>
import { formatFileSize } from '@/utils/common'
import { attachmentAccept, attachmentSelectionError } from '../attachments'

export default {
  props: {
    modelValue: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'input', 'change'],
  data() {
    return { attachmentAccept }
  },
  computed: {
    retentionDays() {
      return this.$store.getters.publicSettings.TICKET_ATTACHMENT_RETENTION_DAYS || 30
    }
  },
  methods: {
    formatFileSize,
    update(files) {
      this.$emit('update:modelValue', files)
      this.$emit('input', files)
    },
    addFiles(selected) {
      if (this.disabled || !selected.length) return
      const files = [...this.modelValue, ...Array.from(selected)]
      const error = attachmentSelectionError(files)
      if (error) return this.$message.error(this.$t(error))
      this.update(files)
    },
    selectFiles(event) {
      this.addFiles(event.target.files)
      event.target.value = ''
    },
    pasteFiles(event) {
      const files = Array.from(event.clipboardData?.files || []).filter((file) =>
        file.type.startsWith('image/')
      )
      if (!files.length) return
      event.preventDefault()
      this.addFiles(files)
    },
    remove(index) {
      if (!this.disabled) this.update(this.modelValue.filter((_, i) => i !== index))
    }
  }
}
</script>

<style scoped>
.ticket-attachment-upload {
  width: 100%;
  min-width: 0;
  line-height: 1.5;
  border-radius: var(--el-border-radius-base);
}
.attachment-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  min-height: 30px;
}
.ticket-attachment-upload:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
.attachment-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-lighter);
}
.attachment-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  padding: 4px 12px;
}
.attachment-list li + li {
  border-top: 1px solid var(--el-border-color-lighter);
}
.attachment-icon {
  flex-shrink: 0;
  color: var(--el-text-color-regular);
  font-size: 16px;
}
.attachment-name {
  flex: 1;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
.attachment-size {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.attachment-hint,
.attachment-help {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.attachment-help {
  margin-top: 8px;
  line-height: 1.6;
}
.attachment-help p {
  margin: 0;
}
</style>
