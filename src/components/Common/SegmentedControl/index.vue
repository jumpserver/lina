<template>
  <el-segmented v-bind="$attrs" class="segmented-control" size="small" :validate-event="false">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </el-segmented>
</template>

<script>
export default {
  name: 'SegmentedControl',
  inheritAttrs: false
}
</script>

<style lang="scss" scoped>
.segmented-control {
  --el-segmented-padding: 4px;
  --el-segmented-color: var(--el-text-color-regular);
  // 半透明中性底座在白色卡片和灰色页面上都比所在背景略深。
  --el-segmented-bg-color: color-mix(in srgb, var(--el-text-color-primary) 7%, transparent);
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: var(--el-bg-color);
  --el-segmented-item-hover-bg-color: transparent;
  --el-segmented-item-active-bg-color: transparent;

  min-height: 32px;
  max-width: 100%;
  border-radius: 8px;
  font-size: 12px;
  vertical-align: middle;
  align-self: flex-start;
  overflow-x: auto;

  :deep(.el-segmented__item) {
    min-height: 24px;
    padding: 0 12px;
    border-radius: 6px;
    font-weight: 500;
  }

  :deep(.el-segmented__item-selected) {
    border-radius: 6px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
    transition:
      transform 200ms ease-out,
      width 200ms ease-out;
  }

  :deep(.el-segmented__item-selected.is-focus-visible::before) {
    outline-color: var(--el-color-primary);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.el-segmented__item-selected),
    :deep(.el-segmented__item-label) {
      transition: none;
    }
  }
}
</style>
