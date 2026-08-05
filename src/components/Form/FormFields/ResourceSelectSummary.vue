<template>
  <div class="resource-select-summary" :class="{ 'is-disabled': disabled }">
    <button
      :disabled="disabled"
      :title="text"
      class="resource-select-summary__text"
      type="button"
      @click="$emit('click')"
    >
      {{ text }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ResourceSelectSummary',
  props: {
    text: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style lang="scss" scoped>
.resource-select-summary {
  width: 100%;
  min-height: 30px;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  &.is-disabled {
    color: var(--el-disabled-text-color);
  }
}

.resource-select-summary__text {
  box-sizing: border-box;
  width: 100%;
  min-height: 30px;
  height: 30px;
  overflow: hidden;
  padding: 0 11px;
  border: 1px solid var(--el-border-color);
  border-radius: 0;
  outline: none;
  background: var(--el-fill-color-blank);
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 28px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: border-color var(--el-transition-duration-fast);

  &:hover:not(:disabled) {
    border-color: var(--el-border-color-hover);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &:disabled {
    border-color: var(--el-disabled-border-color);
    background: var(--el-disabled-bg-color);
    cursor: not-allowed;
  }
}
</style>
