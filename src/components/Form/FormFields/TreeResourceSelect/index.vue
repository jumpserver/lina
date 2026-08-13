<template>
  <div :class="rootClass" :style="$attrs.style">
    <ResourceSelectSummary
      :count-text="summaryCountText"
      :disabled="isDisabled"
      :has-more="summaryHasMore"
      :items="selectedSummaryItems"
      :selected-count="selectedValue.length"
      :text="summaryText"
      @click="openDialog"
      @load-more="loadNextSummaryBatch"
      @remove="removeSummaryResource"
    />

    <TreeResourceSelectDialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :query-params="queryParams"
      :resource-name="resourceName"
      :selected-resources="getSelectedSummaryResources()"
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
        this.syncSelectedValue(value)
      }
    }
  },
  methods: {
    openDialog() {
      if (!this.isDisabled && this.resourceUrl) {
        this.dialogVisible = true
      }
    },
    handleConfirm(value, resources) {
      this.cacheSummaryResources(resources)
      this.updateSelectedValue(value)
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
