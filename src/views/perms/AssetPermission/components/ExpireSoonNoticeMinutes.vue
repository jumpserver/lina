<template>
  <div class="expire-soon-notice-minutes">
    <el-switch :model-value="enabled" @update:model-value="handleEnabledChange" />
    <div v-if="enabled" class="input-row">
      <span>{{ $t('ExpireSoonNoticeMinutes') }}</span>
      <el-input-number
        :min="1"
        :model-value="modelValue"
        :step="1"
        step-strictly
        @update:model-value="handleMinutesChange"
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
    defaultMinutes: {
      type: Number,
      required: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      previousMinutes: isPositiveInteger(this.modelValue) ? this.modelValue : this.defaultMinutes
    }
  },
  computed: {
    enabled() {
      return this.modelValue !== null && this.modelValue !== undefined
    },
    preview() {
      if (!isPositiveInteger(this.modelValue)) {
        return ''
      }
      const noticeAt = getExpireSoonNoticeAt(this.dateExpired, this.modelValue)
      return noticeAt && noticeAt.getTime() > Date.now() ? formatNoticeDate(noticeAt) : ''
    }
  },
  methods: {
    handleEnabledChange(enabled) {
      this.$emit('update:modelValue', enabled ? this.previousMinutes : null)
    },
    handleMinutesChange(minutes) {
      if (isPositiveInteger(minutes)) {
        this.previousMinutes = minutes
      }
      this.$emit('update:modelValue', minutes)
    }
  }
}
</script>

<style lang="scss" scoped>
.expire-soon-notice-minutes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview {
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }
}
</style>
