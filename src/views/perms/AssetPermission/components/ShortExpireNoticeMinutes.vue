<template>
  <div class="short-expire-notice-minutes">
    <div class="input-row">
      <el-input-number
        :min="1"
        :model-value="modelValue"
        :step="1"
        :disabled="disabled"
        step-strictly
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <span>{{ $t('Minutes') }}</span>
    </div>
    <div v-if="preview" class="preview">
      {{ $t('ShortExpireNoticePreview', { time: preview }) }}
    </div>
  </div>
</template>

<script>
import { formatNoticeDate, getShortNoticeAt } from '../expireNotice'

export default {
  name: 'ShortExpireNoticeMinutes',
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    dateExpired: {
      type: [String, Date],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  computed: {
    preview() {
      if (!Number.isInteger(this.modelValue) || this.modelValue <= 0) {
        return ''
      }
      const noticeAt = getShortNoticeAt(this.dateExpired, this.modelValue)
      return noticeAt && noticeAt.getTime() > Date.now() ? formatNoticeDate(noticeAt) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.short-expire-notice-minutes {
  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}
</style>
