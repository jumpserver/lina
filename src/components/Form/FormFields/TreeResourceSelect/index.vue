<template>
  <div :class="rootClass" :style="$attrs.style">
    <div class="tree-resource-select__summary" :class="{ 'is-disabled': isDisabled }">
      <button
        :disabled="isDisabled"
        class="tree-resource-select__text"
        type="button"
        @click="openDialog(selectedValue.length > 0)"
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
        class="tree-resource-select__edit"
        type="button"
        @click="openDialog(false)"
      >
        <el-icon><Edit /></el-icon>
      </button>
    </div>

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
import TreeResourceSelectDialog from './dialog.vue'

function getResourceId(item, valueKey) {
  if (item && typeof item === 'object') {
    return item[valueKey] ?? item.value ?? item.id
  }
  return item
}

function normalizeValue(value, valueKey) {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value]
  return values
    .map((item) => getResourceId(item, valueKey))
    .filter((item) => item !== undefined && item !== null && item !== '')
}

export default {
  name: 'TreeResourceSelect',
  components: { TreeResourceSelectDialog },
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
        this.selectedValue = normalizeValue(value, this.valueKey)
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

.tree-resource-select__summary {
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

.tree-resource-select__text {
  box-sizing: border-box;
  width: 100%;
  min-height: 28px;
  overflow: hidden;
  padding: 0 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-overflow: ellipsis;
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

.tree-resource-select__edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary-dark-2);
    transform: translateY(-1px);
  }

  &:disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;
  }
}
</style>
