<template>
  <el-tree
    :data="iTree"
    :default-checked-keys="iValue"
    :default-expand-all="expandAll"
    :default-expanded-keys="defaultExpanded"
    :props="defaultProps"
    :render-content="renderContent"
    class="el-tree-custom"
    node-key="value"
    show-checkbox
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
    },
    expandAll: {
      type: Boolean,
      default: true
    },
    defaultExpanded: {
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
    },
    renderContent(h, { node, data, store }) {
      let label = node.label
      let helpText = ''
      const regex = /(.*?)\s*\((.*?)\)/
      const match = label.match(regex)
      if (match) {
        label = match[1]
        helpText = match[2]
      }

      return (
        <span>
          <span>{label} </span>
          {helpText
            ? (<el-tooltip content={helpText} placement='top'>
              <i class='fa fa-question-circle-o'></i>
            </el-tooltip>) : ''}
        </span>)
    }
  }
}
</script>

<style lang="scss" scoped>

.el-tree-custom ::v-deep {
  .help-tips {
    margin-left: 10px;
    font-size: 12px;
    color: #999;
  }

  .el-tree-node__content:hover {
    background-color: transparent;
  }

  > .el-tree-node > {
    .el-tree-node__content > .el-tree-node__expand-icon {
      display: none;
    }

    .el-tree-node__children {
      margin-left: -25px;
    }
  }
}

</style>
