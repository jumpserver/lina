<template>
  <div :class="rootClass" :style="$attrs.style">
    <ResourceSelectSummary
      :count-text="summaryCountText"
      :disabled="isDisabled"
      :has-more="summaryHasMore"
      :items="selectedSummaryItems"
      :selected-count="selectedValue.length"
      :count-only="summaryCountOnly"
      :text="summaryText"
      @click="openDialog(selectedValue.length > 0 ? 'selected' : 'available')"
      @load-more="loadNextSummaryBatch"
      @remove="removeSummaryResource"
    />

    <ResourceSelectDialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :page-size="pageSize"
      :initial-tab="initialTab"
      :multiple="multiple"
      :node-filter="nodeFilter"
      :query-params="queryParams"
      :resource-name="resourceName"
      :selected-resources="getSelectedSummaryResources()"
      :can-select="canSelect"
      :columns="columns"
      :columns-meta="columnsMeta"
      :columns-show="columnsShow"
      :url="resourceUrl"
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
import ResourceSelectDialog from './dialog.vue'

export default {
  name: 'ResourceSelect',
  components: { ResourceSelectDialog, ResourceSelectSummary },
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
      default: ''
    },
    ajax: {
      type: Object,
      default: () => ({})
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
    nodeFilter: {
      type: [Boolean, Object],
      default: false
    },
    canSelect: {
      type: Function,
      default: () => true
    },
    columnsMeta: {
      type: Object,
      default: () => ({})
    },
    columns: {
      type: Array,
      default: () => []
    },
    columnsShow: {
      type: Object,
      default: () => ({})
    },
    pageSize: {
      type: Number,
      default: 15
    },
    multiple: {
      type: Boolean,
      default: true
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
      initialTab: 'available',
      selectedValue: this.normalizeSelectedValue(
        this.modelValue !== undefined ? this.modelValue : this.value
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
      return this.url || this.ajax?.url || ''
    },
    rootClass() {
      return ['resource-select', this.$attrs.class]
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
    normalizeSelectedValue(value) {
      const normalized = normalizeResourceValue(value, this.valueKey)
      return this.multiple ? normalized : normalized.slice(0, 1)
    },
    updateSelectedValue(value) {
      const normalized = this.normalizeSelectedValue(value)
      const payload = this.multiple ? [...normalized] : normalized[0] ?? null
      this.selectedValue = normalized
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
      this.$emit('change', payload)
    },
    syncSelectedValue(value) {
      this.cacheSummaryResources(value)
      const payload = this.normalizeSelectedValue(value)
      const unchanged =
        payload.length === this.selectedValue.length &&
        payload.every((item, index) => String(item) === String(this.selectedValue[index]))
      if (!unchanged) {
        this.selectedValue = payload
      }
    },
    openDialog(tab = 'available') {
      if (!this.isDisabled && this.resourceUrl) {
        this.initialTab = tab
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
    },
    getSelectedValue() {
      return [...this.selectedValue]
    }
  }
}
</script>

<style lang="scss" scoped>
.resource-select {
  width: 100%;
  min-width: 0;
}
</style>
