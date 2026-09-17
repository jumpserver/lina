<template>
  <i
    :class="[open ? 'fa-folder-open' : 'fa-folder', { 'is-leaf': leaf }]"
    aria-hidden="true"
    class="fa-regular x-tree__node-icon tree-folder-icon"
  />
</template>

<script>
export default {
  name: 'TreeFolderIcon',
  props: {
    leaf: Boolean,
    expanded: Boolean
  },
  computed: {
    open() {
      return this.expanded && !this.leaf
    }
  }
}
</script>

<style scoped>
.x-tree__node-icon.tree-folder-icon {
  flex: none;
  width: var(--x-tree-icon-size, 14px);
  height: var(--x-tree-icon-size, 14px);
  color: var(--el-color-primary);
  font-size: 12px;
}
</style>
