<template>
  <el-dropdown-item :disabled="collapseDisabled" @click="$emit('collapse')">
    <span class="x-tree-tools__icon"><svg-icon icon-class="tree-collapse-all" /></span>
    <span>{{ $t('TreeActionCollapse') }}</span>
  </el-dropdown-item>
  <el-dropdown-item :disabled="clearDisabled" @click="$emit('clear')">
    <span class="x-tree-tools__icon"
      ><el-icon><Brush /></el-icon
    ></span>
    <span>{{ $t('ClearSelection') }}</span>
  </el-dropdown-item>
</template>

<script>
export default {
  name: 'NodeSearchTreeMenu',
  props: {
    clearDisabled: {
      type: Boolean,
      default: false
    },
    collapseDisabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['clear', 'collapse']
}
</script>
