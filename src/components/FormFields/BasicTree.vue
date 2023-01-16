<template>
  <el-tree
    :data="iTree"
    show-checkbox
    node-key="value"
    :default-expand-all="true"
    :default-expanded-keys="iValue"
    :default-checked-keys="iValue"
    :props="defaultProps"
    @check="handleCheckChange"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    tree: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  computed: {
    iValue() {
      return this.value.map(item => {
        if (item.value) {
          return item.value
        }
        return item
      })
    },
    iTree() {
      if (!this.readonly) {
        return this.tree
      } else {
        return this.setTreeReadonly(this.tree)
      }
    }
  },
  methods: {
    handleCheckChange(node, { checkedNodes }) {
      const checkedKeys = checkedNodes
        .filter(item => !item.children)
        .map(node => node.value)
      this.$emit('input', checkedKeys)
    },
    setTreeReadonly(tree) {
      return tree.map(item => {
        item.disabled = true
        if (item.children) {
          item.children = this.setTreeReadonly(item.children)
        }
        return item
      })
    }
  }
}
</script>

<style scoped>

</style>
