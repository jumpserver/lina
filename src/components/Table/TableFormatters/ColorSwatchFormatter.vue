<template>
  <span :title="displayColor" class="color-swatch-formatter">
    <span :style="{ backgroundColor: displayColor }" class="color-swatch-formatter__color" />
  </span>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'ColorSwatchFormatter',
  extends: BaseFormatter,
  computed: {
    displayColor() {
      return this.cellValue || 'transparent'
    }
  }
}
</script>

<style lang="scss" scoped>
.color-swatch-formatter {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  vertical-align: middle;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-fill-color-blank);
}

.color-swatch-formatter__color {
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-text-color-secondary);
  border-radius: var(--el-border-radius-small);
}
</style>
