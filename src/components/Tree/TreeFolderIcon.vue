<template>
  <el-icon :class="{ 'is-leaf': leaf }" class="x-tree__node-icon tree-folder-icon">
    <svg
      :style="{ fill: leaf ? 'var(--el-color-white)' : 'currentColor' }"
      viewBox="0 0 24 24"
      aria-hidden="true"
      stroke="currentColor"
      stroke-linejoin="round"
    >
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z"
        :opacity="open ? 0.45 : 1"
        stroke-width="1.5"
      />
      <path v-if="open" d="M7 11h15l-3.5 9h-15Z" stroke-width="1.5" />
    </svg>
  </el-icon>
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
.tree-folder-icon {
  flex: none;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
