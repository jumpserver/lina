<template>
  <div :class="rootClass" :style="$attrs.style">
    <div class="resource-select__summary" :class="{ 'is-disabled': isDisabled }">
      <button
        :disabled="isDisabled"
        class="resource-select__text"
        type="button"
        @click="openDialog(selectedValue.length > 0 ? 'selected' : 'available')"
      >
        {{
          selectedValue.length
            ? $t('ResourceSelectSelectedCount', { count: selectedValue.length })
            : $t('ResourceSelectEmpty')
        }}
      </button>
      <button
        :aria-label="$t('Edit')"
        :disabled="isDisabled"
        :title="$t('Edit')"
        class="resource-select__edit"
        type="button"
        @click="openDialog('available')"
      >
        <el-icon><Edit /></el-icon>
      </button>
    </div>

    <ResourceSelectDialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :page-size="pageSize"
      :initial-tab="initialTab"
      :node-filter="nodeFilter"
      :query-params="queryParams"
      :resource-name="resourceName"
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
import ResourceSelectDialog from './dialog.vue'

function getResourceId(item, valueKey) {
  if (item && typeof item === 'object') {
    return item[valueKey] ?? item.value ?? item.id
  }
  return item
}

function normalizeValue(value, valueKey) {
  if (!Array.isArray(value)) {
    return value === undefined || value === null || value === ''
      ? []
      : [getResourceId(value, valueKey)]
  }
  return value
    .map((item) => getResourceId(item, valueKey))
    .filter((item) => item !== undefined && item !== null && item !== '')
}

export default {
  name: 'ResourceSelect',
  components: { ResourceSelectDialog },
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
      selectedValue: normalizeValue(
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
        this.selectedValue = normalizeValue(value, this.valueKey)
      }
    }
  },
  methods: {
    openDialog(tab = 'available') {
      if (!this.isDisabled && this.resourceUrl) {
        this.initialTab = tab
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

.resource-select__summary {
  display: grid;
  grid-template-columns: minmax(0, 132px) 22px;
  align-items: center;
  gap: 4px;
  width: min(100%, 158px);
  min-height: 30px;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  &.is-disabled {
    color: var(--el-disabled-text-color);
  }
}

.resource-select__text {
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  min-height: 28px;
  padding: 0 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.resource-select__edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0;
  padding: 2px;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  opacity: 1;
  visibility: visible;
  border-radius: 4px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary-dark-2);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-5);
    outline-offset: 1px;
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}
</style>
