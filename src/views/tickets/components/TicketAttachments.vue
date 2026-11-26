<template>
  <IBox v-if="files.length" class="attachment-card" :title="$t('Attachments')">
    <ul class="ticket-attachments">
      <li v-for="file in files" :key="file.id">
        <el-icon class="attachment-icon" aria-hidden="true"><Document /></el-icon>
        <div class="attachment-info">
          <div class="attachment-name">{{ file.name }}</div>
          <div class="attachment-meta">
            <span>{{ formatFileSize(file.size) }}</span>
            <span v-if="isExpired(file)">{{ $t('TicketAttachmentExpired') }}</span>
            <span v-else>{{
              $t('TicketAttachmentExpires', { date: toSafeLocalDateStr(file.expires_at) })
            }}</span>
          </div>
        </div>
        <el-link
          v-if="!isExpired(file)"
          class="attachment-download"
          :href="fileUrl(file)"
          :aria-label="$t('Download') + ' ' + file.name"
          type="primary"
          :underline="'hover'"
          >{{ $t('Download') }}</el-link
        >
      </li>
    </ul>
  </IBox>
</template>

<script>
import { formatFileSize } from '@/utils/common'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import IBox from '@/components/Common/IBox/index.vue'

export default {
  components: { IBox },
  props: { object: { type: Object, required: true } },
  data() {
    return { now: Date.now(), timer: null }
  },
  computed: {
    files() {
      return this.object.attachments || []
    }
  },
  watch: {
    files: {
      immediate: true,
      handler() {
        this.scheduleExpiry()
      }
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },
  methods: {
    formatFileSize,
    toSafeLocalDateStr,
    isExpired(file) {
      return file.expired || Date.parse(file.expires_at) <= this.now
    },
    scheduleExpiry() {
      clearTimeout(this.timer)
      this.now = Date.now()
      const deadlines = this.files
        .filter((file) => !this.isExpired(file))
        .map((file) => Date.parse(file.expires_at))
      if (deadlines.length) {
        this.timer = setTimeout(
          () => this.scheduleExpiry(),
          Math.min(Math.min(...deadlines) - this.now, 2147483647)
        )
      }
    },
    fileUrl(file) {
      return `/api/v1/tickets/tickets/${encodeURIComponent(this.object.id)}/attachments/${encodeURIComponent(file.id)}/?oid=${encodeURIComponent(this.object.org_id)}`
    }
  }
}
</script>

<style scoped>
.attachment-card {
  margin-bottom: 15px;
  line-height: 1.6;
}
.ticket-attachments {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ticket-attachments li {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  padding: 10px 0;
}
.ticket-attachments li:first-child {
  padding-top: 0;
}
.ticket-attachments li:last-child {
  padding-bottom: 0;
}
.ticket-attachments li + li {
  border-top: 1px solid var(--el-border-color-lighter);
}
.attachment-icon {
  margin-top: 2px;
  font-size: 20px;
  color: var(--el-text-color-regular);
}
.attachment-info {
  min-width: 0;
  line-height: 1.6;
}
.attachment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.attachment-name {
  color: var(--el-text-color-primary);
  overflow-wrap: anywhere;
}
.attachment-download {
  min-height: 24px;
  white-space: nowrap;
}
</style>
