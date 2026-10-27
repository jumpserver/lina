<template>
  <div class="ticket-upload-files">
    <input ref="input" type="file" multiple hidden @change="selectFiles" />
    <el-button :loading="busy" :disabled="!orgId || busy" @click="$refs.input.click()">
      {{ $t('SelectFile') }}
    </el-button>
    <p class="help-block">{{ $t('TicketTransferUploadHelp') }}</p>
    <ul v-if="files.length" class="ticket-upload-list">
      <li v-for="file in files" :key="file.id">
        <span
          >{{ file.name }} <small>{{ formatFileSize(file.size) }}</small></span
        >
        <el-button link type="danger" :disabled="busy" @click="remove(file.id)">{{
          $t('Remove')
        }}</el-button>
      </li>
    </ul>
  </div>
</template>
<script>
import { formatFileSize } from '@/utils/common'

export default {
  props: {
    modelValue: { type: Array, default: () => [] },
    orgId: { type: String, default: '' }
  },
  // Keep the native file-input change event out of DataForm's value listener.
  emits: ['update:modelValue', 'input', 'change', 'busy'],
  data: () => ({ files: [], busy: false, generation: 0 }),
  watch: {
    orgId() {
      this.reset()
    },
    modelValue(value) {
      if (!value?.length) this.reset()
      else this.files = this.files.filter((file) => value.includes(file.id))
    }
  },
  beforeUnmount() {
    this.reset()
  },
  methods: {
    formatFileSize,
    emitFiles() {
      const ids = this.files.map((file) => file.id)
      this.$emit('update:modelValue', ids)
      this.$emit('input', ids)
    },
    reset() {
      this.generation++
      this.files = []
      this.busy = false
      this.$emit('busy', false)
    },
    remove(id) {
      this.files = this.files.filter((file) => file.id !== id)
      this.emitFiles()
    },
    async selectFiles(event) {
      const selected = Array.from(event.target.files || [])
      event.target.value = ''
      if (!selected.length || !this.orgId || this.busy) return
      if (
        this.files.length + selected.length > 20 ||
        new Set([...this.files, ...selected].map((f) => f.name)).size !==
          this.files.length + selected.length
      ) {
        this.$message.error(this.$t('TicketTransferFileSelectionError'))
        return
      }
      const generation = ++this.generation
      const orgId = this.orgId
      this.busy = true
      this.$emit('busy', true)
      try {
        for (const file of selected) {
          const data = new FormData()
          data.append('org_id', orgId)
          data.append('file', file)
          const uploaded = await this.$axios.post(
            '/api/v1/tickets/ticket-types/file_transfer/upload-file/',
            data
          )
          if (generation !== this.generation || orgId !== this.orgId) return
          this.files.push(uploaded)
        }
      } finally {
        if (generation === this.generation) {
          this.busy = false
          this.$emit('busy', false)
          this.emitFiles()
        }
      }
    }
  }
}
</script>
<style scoped>
.ticket-upload-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
}
.ticket-upload-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
}
.ticket-upload-list span {
  overflow-wrap: anywhere;
  min-width: 0;
}
.ticket-upload-list small {
  color: var(--el-text-color-regular);
  margin-inline-start: 8px;
}
</style>
