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

<script lang="jsx">
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
      default: false
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
      if (!this.value) {
        return []
      }
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
  mounted() {
    if (this.iTree && this.iTree.length > 0) {
      this.defaultExpanded.push(this.iTree[0].value)
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

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  //节点有间隙，隐藏掉展开按钮就好了,如果觉得空隙没事可以删掉
  .el-tree-node__expand-icon.is-leaf {
    display: none;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
    display: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
    display: none;
  }

  .el-tree-node__children {
    padding-left: 13px;

    .el-tree-node {
      position: relative;
      padding-left: 13px;

      &:before {
        content: "";
        left: -4px;
        position: absolute;
        right: auto;
        border-width: 1px;
      }

      &:first-child::before {
        display: none;
      }

      &:last-child:before {
        height: 38px;
      }

      &:before {
        border-left: 1px dashed #dcdcdc;
        bottom: 0;
        height: 100%;
        top: -26px;
        width: 1px;
      }

      &:after {
        content: "";
        left: -4px;
        position: absolute;
        right: auto;
        border-width: 1px;
      }

      &:after {
        border-top: 1px dashed #dcdcdc;
        height: 20px;
        top: 12px;
        width: 24px;
      }
    }
  }

  .el-tree-node__content:hover {
    background-color: transparent;
  }

  .el-tree-node:focus > .el-tree-node__content {
    background-color: transparent;
  }

  > .el-tree-node > {
    .el-tree-node__content > .el-tree-node__expand-icon {
      display: none;
    }

    .el-tree-node__children {
      //margin-left: -25px;
    }
  }
}

</style>
