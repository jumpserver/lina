<template>
  <el-tree
    :data="iData"
    show-checkbox
    node-key="id"
    :default-expand-all="true"
    :default-checked-keys="value"
    :props="defaultProps"
    v-bind="$attrs"
    @check="handleCheckChange"
  />
</template>

<script>
export default {
  name: 'FormTypeField',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    choices: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      fullChoicesTreeNodes: [
        {
          id: 'all',
          label: this.$t('perms.all'),
          children: [
            {
              id: 'asset',
              label: this.$t('route.AssetAccount')
            },
            {
              id: 'application',
              label: this.$t('route.ApplicationAccount')
            }
          ]
        }
      ]
    }
  },
  computed: {
    choicesIDs() {
      return this.choices.map((v) => v.value)
    },
    iData() {
      this.$log.debug('choices: ', this.choicesIDs)
      const fullTreeNodes = _.cloneDeep(this.fullChoicesTreeNodes)
      const treeNodes = this.trimChoicesTreeNodes(fullTreeNodes)
      this.$log.debug('choicesTreeNodes: ', treeNodes)
      return treeNodes
    }
  },
  methods: {
    trimChoicesTreeNodes(treeNodes) {
      const newTreeNodes = []
      for (const treeNode of treeNodes) {
        if (!this.choicesIDs.includes(treeNode.id)) {
          continue
        }
        let children = treeNode.children || []
        if (children.length !== 0) {
          children = this.trimChoicesTreeNodes(children)
          treeNode.children = children
        }
        newTreeNodes.push(treeNode)
      }
      return newTreeNodes
    },
    handleCheckChange(data, obj) {
      const checkedKeys = obj.checkedKeys
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
