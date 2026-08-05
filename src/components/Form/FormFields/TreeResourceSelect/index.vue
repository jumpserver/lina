<template>
  <div :class="rootClass" :style="$attrs.style">
    <ResourceSelectSummary
      :disabled="isDisabled"
      :text="summaryText"
      @click="openDialog(selectedValue.length > 0)"
    />

    <TreeResourceSelectDialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :initial-selected-only="initialSelectedOnly"
      :query-params="queryParams"
      :resource-name="resourceName"
      :tree-url="resourceTreeUrl"
      :value="selectedValue"
      :value-key="valueKey"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import ResourceSelectSummary from '../ResourceSelectSummary.vue'
import resourceSelectSummary, { normalizeResourceValue } from '../resourceSelectSummary'
import TreeResourceSelectDialog from './dialog.vue'

export default {
  name: 'TreeResourceSelect',
  components: { ResourceSelectSummary, TreeResourceSelectDialog },
  mixins: [resourceSelectSummary],
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    modelValue: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    url: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrl: {
      type: String,
      default: ''
    },
    resourceName: {
      type: String,
      default: ''
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    queryParams: {
      type: [Object, Function],
      default: () => ({})
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  data() {
    return {
      dialogVisible: false,
      initialSelectedOnly: false,
      selectedValue: normalizeResourceValue(
        this.modelValue !== undefined ? this.modelValue : this.value,
        this.valueKey
      )
    }
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    isDisabled() {
      return typeof this.disabled === 'function' ? this.disabled() : this.disabled
    },
    resourceUrl() {
      return this.url
    },
    resourceTreeUrl() {
      if (this.treeUrl) {
        return this.treeUrl
      }
      return `${this.url.replace(/\?.*$/, '').replace(/\/?$/, '/')}children/tree/?asset_amount=0&all=all`
    },
    rootClass() {
      return ['tree-resource-select', this.$attrs.class]
    }
  },
  watch: {
    externalValue: {
      deep: true,
      handler(value) {
        this.selectedValue = normalizeResourceValue(value, this.valueKey)
      }
    }
  },
  methods: {
    openDialog(selectedOnly = false) {
      if (!this.isDisabled && this.resourceUrl) {
        this.initialSelectedOnly = selectedOnly
        this.dialogVisible = true
      }
    },
    handleConfirm(value) {
      const payload = [...value]
      this.selectedValue = payload
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
      this.$emit('change', payload)
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-resource-select {
  width: 100%;
  min-width: 0;
}
</style>
