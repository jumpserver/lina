<template>
  <div class="expire-soon-notice-minutes">
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
      {{ $t('ExpireSoonNoticePreview', { time: preview }) }}
    </div>
  </div>
</template>

<script>
import { formatNoticeDate, getExpireSoonNoticeAt, isPositiveInteger } from '../expireSoonNotice'

export default {
  name: 'ExpireSoonNoticeMinutes',
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
      if (!isPositiveInteger(this.modelValue)) {
        return ''
      }
      const noticeAt = getExpireSoonNoticeAt(this.dateExpired, this.modelValue)
      return noticeAt && noticeAt.getTime() > Date.now() ? formatNoticeDate(noticeAt) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.expire-soon-notice-minutes {
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
