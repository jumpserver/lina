<template>
  <el-tree
    :data="iTree"
    :default-checked-keys="iValue"
    :default-expand-all="expandAll"
    :default-expanded-keys="iDefaultExpanded"
    :props="defaultProps"
    :render-content="renderContent"
    class="el-tree-custom"
    node-key="value"
    show-checkbox
    @check="handleCheckChange"
  />
</template>

<script>
import { ElTooltip } from 'element-plus'

export default {
  inheritAttrs: false,
  emits: ['input', 'update:modelValue'],
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    modelValue: {
      type: [Array, String],
      default: undefined
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
  emits: ['change', 'input', 'update:modelValue', 'update:model-value'],
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
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      if (!Array.isArray(value)) {
        return []
      }
      return value.map((item) => {
        if (item && typeof item === 'object' && 'value' in item) {
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
    },
    // 默认展开一层:根节点 value 与外部传入的 defaultExpanded 合并。
    // el-tree 只在初始化时读取 default-expanded-keys,必须在首次渲染前就备好
    // (原先在 mounted 里 push 太晚,且改动了 prop,故从不生效)
    iDefaultExpanded() {
      const keys = [...this.defaultExpanded]
      const rootValue = this.iTree?.[0]?.value
      if (rootValue !== undefined && !keys.includes(rootValue)) {
        keys.push(rootValue)
      }
      return keys
    }
  },
  methods: {
    handleCheckChange(node, { checkedNodes }) {
      const checkedKeys = checkedNodes.filter((item) => !item.children).map((node) => node.value)
      this.$emit('input', checkedKeys)
      this.$emit('update:modelValue', checkedKeys)
      this.$emit('update:model-value', checkedKeys)
      this.$emit('change', checkedKeys)
    },
    setTreeReadonly(tree) {
      return tree.map((item) => {
        item.disabled = true
        if (item.children) {
          item.children = this.setTreeReadonly(item.children)
        }
        return item
      })
    },
    renderContent(h, { node }) {
      let label = node.label
      let helpText = ''
      const regex = /(.*?)\s*\((.*?)\)/
      const match = label.match(regex)
      if (match) {
        label = match[1]
        helpText = match[2]
      }

      const children = [h('span', `${label} `)]

      if (helpText) {
        children.push(
          h(
            ElTooltip,
            {
              content: helpText,
              placement: 'top',
              popperClass: 'help-tips',
              showAfter: 300,
              trigger: 'hover'
            },
            {
              default: () =>
                h('i', {
                  class: 'fa fa-question-circle-o',
                  onClick: (event) => event.stopPropagation()
                })
            }
          )
        )
      }

      return h('span', children)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tree-custom {
  --el-tree-node-hover-bg-color: transparent;
  background-color: transparent;

  :deep(.el-tree-node) {
    position: relative;
  }

  :deep(.el-tree-node__content) {
    height: 26px;
    background-color: transparent !important;
  }

  :deep(.el-tree-node__content:hover),
  :deep(.el-tree-node:focus > .el-tree-node__content),
  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: transparent !important;
  }

  :deep(.el-tree-node__expand-icon.is-leaf) {
    visibility: hidden;
  }

  :deep(> .el-tree-node > .el-tree-node__content > .el-tree-node__expand-icon) {
    display: none;
  }

  :deep(.el-tree-node__children) {
    position: relative;
    padding-left: 28px;
  }

  :deep(.el-tree-node__children .el-tree-node)::before {
    content: '';
    position: absolute;
    left: -17px;
    top: -13px;
    bottom: 13px;
    border-left: 1px dashed #d8dce5;
  }

  :deep(.el-tree-node__children .el-tree-node)::after {
    content: '';
    position: absolute;
    left: -17px;
    top: 13px;
    width: 24px;
    border-top: 1px dashed #d8dce5;
  }

  :deep(.el-tree-node__children .el-tree-node:first-child)::before {
    top: -1px;
  }

  :deep(.el-tree-node__children .el-tree-node:last-child)::before {
    bottom: auto;
    height: 26px;
  }

  :deep(.el-tree-node__label .fa),
  :deep(.fa-question-circle-o) {
    margin-left: 4px;
    color: var(--color-icon-primary);
    font-size: 12px;
  }
}
</style>
