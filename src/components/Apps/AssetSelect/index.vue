<template>
  <div :class="rootClass" :style="rootStyle">
    <div
      class="asset-select__trigger"
      :class="{ 'is-disabled': isDisabled, 'is-empty': selectedRows.length === 0 }"
      :title="displayValue"
      @click="openDialog"
    >
      <span v-if="selectedRows.length === 0" class="asset-select__placeholder">
        {{ inputPlaceholder }}
      </span>
      <el-tag
        v-for="item in selectedRows"
        v-else
        :key="item.id"
        class="asset-select__tag"
        :closable="!isDisabled"
        disable-transitions
        size="small"
        type="info"
        @close="removeAsset(item)"
      >
        {{ formatAssetLabel(item) }}
      </el-tag>
      <el-icon class="asset-select__icon"><Search /></el-icon>
    </div>
    <AssetSelectDialog
      v-if="dialogVisible"
      ref="dialog"
      v-model:visible="dialogVisible"
      :base-node-url="baseNodeUrl"
      :base-url="baseUrl"
      :tree-setting="treeSetting"
      :tree-url-query="treeUrlQuery"
      :value="selectedValue"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script>
import { createSourceIdCache } from '@/api/common'
import AssetSelectDialog from './dialog.vue'

function normalizeAssetValue(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => (typeof item === 'object' && item !== null ? item.id : item))
}

function extractAssetRows(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item) => typeof item === 'object' && item !== null && item.id !== undefined)
}

function formatAssetLabel(item) {
  if (!item || typeof item !== 'object') {
    return ''
  }

  if (item.name && item.address) {
    return `${item.name}(${item.address})`
  }

  return item.name || item.address || item.id || ''
}

export default {
  componentName: 'AssetSelect',
  components: { AssetSelectDialog },
  inheritAttrs: false,
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrlQuery: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: Array,
      default: () => []
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  emits: ['change', 'input', 'update:model-value', 'update:modelValue'],
  data() {
    return {
      dialogVisible: false,
      selectedValue: normalizeAssetValue(this.value),
      selectedRows: extractAssetRows(this.value)
    }
  },
  computed: {
    isDisabled() {
      return typeof this.disabled === 'function' ? this.disabled() : this.disabled
    },
    rootClass() {
      return ['asset-select', this.$attrs.class]
    },
    rootStyle() {
      return this.$attrs.style
    },
    inputPlaceholder() {
      return this.$attrs.placeholder || this.$t('PleaseSelect')
    },
    displayValue() {
      if (this.selectedRows.length === 0) {
        return ''
      }

      return this.selectedRows
        .map((item) => formatAssetLabel(item))
        .filter(Boolean)
        .join(', ')
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(newValue) {
        this.syncSelectedState(newValue)
      }
    }
  },
  methods: {
    // 暴露给模板使用(formatAssetLabel 是模块级函数,模板无法直接访问)
    formatAssetLabel(item) {
      return formatAssetLabel(item)
    },
    removeAsset(item) {
      if (this.isDisabled || !item) {
        return
      }
      this.selectedValue = this.selectedValue.filter((id) => id !== item.id)
      this.selectedRows = this.selectedRows.filter((row) => row.id !== item.id)
      this.emitValue(this.selectedValue)
    },
    openDialog() {
      if (this.isDisabled || this.dialogVisible) {
        return
      }
      this.dialogVisible = true
    },
    handleConfirm(valueSelected, rowsAdd) {
      if (valueSelected === undefined) {
        return
      }

      this.selectedValue = _.cloneDeep(valueSelected)
      this.mergeRows(rowsAdd)
      this.selectedRows = this.selectedRows.filter((item) => this.selectedValue.includes(item.id))
      this.emitValue(this.selectedValue)
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    emitValue(value) {
      const payload = _.cloneDeep(value)
      this.$emit('input', payload)
      this.$emit('update:model-value', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('change', payload)
    },
    mergeRows(rows = []) {
      if (!Array.isArray(rows) || rows.length === 0) {
        return
      }

      const rowMap = new Map(this.selectedRows.map((item) => [item.id, item]))
      rows.forEach((row) => {
        if (row?.id !== undefined) {
          rowMap.set(row.id, row)
        }
      })
      this.selectedRows = this.selectedValue
        .map((id) => rowMap.get(id))
        .filter((item) => item !== undefined)
    },
    async syncSelectedState(value) {
      const ids = normalizeAssetValue(value)
      const rows = extractAssetRows(value)

      this.selectedValue = _.cloneDeep(ids)

      if (rows.length > 0) {
        this.selectedRows = rows
      } else if (ids.length === 0) {
        this.selectedRows = []
      }

      const missingIds = ids.filter((id) => {
        return !this.selectedRows.some((row) => row?.id === id)
      })

      if (missingIds.length > 0) {
        await this.fetchSelectedRows(ids)
      } else {
        this.selectedRows = ids
          .map((id) => this.selectedRows.find((row) => row?.id === id))
          .filter((item) => item !== undefined)
      }
    },
    async fetchSelectedRows(ids) {
      try {
        const { spm } = await createSourceIdCache(ids)
        const resp = await this.$axios.get(this.baseUrl, {
          params: {
            limit: Math.max(ids.length, this.defaultPageSize),
            offset: 0,
            spm
          }
        })
        const results = Array.isArray(resp) ? resp : resp?.results || []
        const rowMap = new Map(results.map((item) => [item.id, item]))
        this.selectedRows = ids.map((id) => rowMap.get(id)).filter((item) => item !== undefined)
      } catch (error) {
        this.$log?.warn?.('AssetSelect failed to load selected assets', error)
      }
    },
    getSelectedValue() {
      return _.cloneDeep(this.selectedValue)
    },
    clearSelected() {
      this.selectedValue = []
      this.selectedRows = []
      this.emitValue([])
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select {
  display: block;
  flex: 1 1 100%;
  min-width: 0;
  width: 100%;
}

.asset-select__trigger {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-height: 30px;
  padding: 3px 28px 3px 8px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base, 4px);
  background-color: var(--el-fill-color-blank, #fff);
  cursor: pointer;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &.is-disabled {
    background-color: var(--el-disabled-bg-color, #f5f7fa);
    border-color: var(--el-disabled-border-color, #e4e7ed);
    cursor: not-allowed;
  }
}

.asset-select__placeholder {
  color: var(--el-text-color-placeholder, var(--color-text-placeholder));
  font-size: 13px;
  line-height: 22px;
}

.asset-select__tag {
  max-width: 100%;

  :deep(.el-tag__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.asset-select__icon {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  color: var(--el-text-color-placeholder, var(--color-text-placeholder));
  pointer-events: none;
}
</style>
