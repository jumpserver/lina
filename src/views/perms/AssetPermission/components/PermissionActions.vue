<template>
  <BasicTree
    v-bind="{ ...$attrs, ...$props }"
    :tree="displayTree"
    :model-value="displayValue"
    @change="handleChange"
  />
</template>

<script>
import BasicTree from '@/components/Form/FormFields/BasicTree.vue'

// Asset visibility is implicit in existing rules; this node is for display only.
const VIEW_NODE = '__asset_permission_view__'

export default {
  components: { BasicTree },
  inheritAttrs: false,
  props: BasicTree.props,
  emits: ['change', 'input', 'update:modelValue', 'update:model-value'],
  computed: {
    displayTree() {
      const [root, ...rest] = this.tree
      if (!root) return []
      return [
        {
          ...root,
          children: [
            {
              value: VIEW_NODE,
              label: `${this.$t('View')} (${this.$t('AssetPermissionViewHelp')})`,
              disabled: true
            },
            ...(root.children || [])
          ]
        },
        ...rest
      ]
    },
    displayValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return [VIEW_NODE, ...(Array.isArray(value) ? value : [])]
    }
  },
  methods: {
    handleChange(values) {
      const actions = values.filter((value) => value !== VIEW_NODE)
      this.$emit('input', actions)
      this.$emit('update:modelValue', actions)
      this.$emit('update:model-value', actions)
      this.$emit('change', actions)
    }
  }
}
</script>
