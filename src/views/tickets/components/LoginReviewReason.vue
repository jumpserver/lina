<template>
  <span class="reason">
    <span ref="previewElement" class="reason-preview"
      >{{ preview }}{{ preview !== value ? '…' : '' }}</span
    >
    <el-tooltip
      v-if="preview !== value || clipped"
      :trigger="['hover', 'focus']"
      effect="light"
      placement="bottom-start"
      :show-after="150"
      :popper-style="{ maxWidth: 'min(480px, calc(100vw - 32px))', boxSizing: 'border-box' }"
    >
      <template #content>
        <div class="reason-full">{{ value }}</div>
      </template>
      <el-button link type="primary">{{ $t('ViewFullText') }}</el-button>
    </el-tooltip>
  </span>
</template>

<script>
export default {
  props: { value: { type: String, required: true } },
  data() {
    return { clipped: false }
  },
  computed: {
    preview() {
      return Array.from(this.value).slice(0, 120).join('').split('\n').slice(0, 3).join('\n')
    }
  },
  watch: {
    preview: { handler: 'measurePreview', flush: 'post' }
  },
  mounted() {
    this.observer = new ResizeObserver(this.measurePreview)
    this.observer.observe(this.$refs.previewElement)
  },
  beforeUnmount() {
    this.observer.disconnect()
  },
  methods: {
    measurePreview() {
      const el = this.$refs.previewElement
      this.clipped = el.scrollHeight > el.clientHeight
    }
  }
}
</script>

<style scoped>
.reason {
  display: block;
  line-height: 1.5;
}

.reason-preview,
.reason-full {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reason .reason-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.reason-full {
  max-height: min(240px, 40vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  line-height: 1.6;
}
</style>
