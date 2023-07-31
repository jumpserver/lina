<template>
  <div ref="boxDom" class="tooltip">
    <el-tooltip
      :content="content"
      :disabled="showTooltip"
      :effect="effect"
      :placement="placement"
    >
      <div class="multi-line-limit">{{ content }}</div>
    </el-tooltip>
    <div ref="virtualDom" class="virtual-dom">{{ content }}</div>
  </div>
</template>

<script>
export default {
  name: 'Tooltip',
  props: {
    content: {
      type: String,
      default: () => ''
    },
    placement: {
      type: String,
      default: () => 'top'
    },
    effect: {
      type: String,
      default: () => 'dark'
    },
    line: {
      type: Number,
      default: () => 3
    }
  },
  data() {
    return {
      showTooltip: true
    }
  },
  watch: {
    content: {
      handler() {
        this.$nextTick(() => this.checkWidth())
      },
      immediate: true
    }
  },
  mounted() {
    this.setUI()
  },
  methods: {
    checkWidth() {
      const boxWidth = this.$refs.boxDom.offsetWidth
      const textWidth = this.$refs.virtualDom.offsetWidth
      this.showTooltip = boxWidth * this.line > textWidth
    },
    setUI() {
      this.$refs.boxDom.style.setProperty('--line', `${this.line * 18}px`)
    }
  }
}
</script>
<style lang="less" scoped>
  .tooltip {
    margin-bottom: 10px;
  }
  .multi-line-limit {
    line-height: 15px;
    height: var(--line);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .virtual-dom {
    position:absolute;
    visibility: hidden;
    white-space: nowrap;
    z-index: -100;
  }
</style>
