<template>
  <Icon
    :class="{ 'is-leaf': leaf }"
    :icon="open ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder'"
    class="x-tree__node-icon tree-folder-icon"
  />
</template>

<script>
import Icon from '@/components/Widgets/Icon'

export default {
  name: 'TreeFolderIcon',
  components: { Icon },
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
  font-size: 12px;
}
</style>
