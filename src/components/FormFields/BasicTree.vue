<template>
  <el-tree
    :data="tree"
    show-checkbox
    node-key="value"
    :default-expand-all="false"
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
    }
  },
  methods: {
    handleCheckChange(node, { checkedNodes }) {
      const checkedKeys = checkedNodes
        .filter(item => !item.children)
        .map(node => node.value)
      if (checkedKeys.length !== 0) {
        checkedKeys.push('connect')
      }
      this.$emit('input', checkedKeys)
    }
  }
}
</script>

<style scoped>

</style>
