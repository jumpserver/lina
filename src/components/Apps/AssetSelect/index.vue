<template>
  <div :class="rootClass" :style="rootStyle">
    <el-input
      ref="input"
      class="asset-select__input"
      :disabled="isDisabled"
      :model-value="displayValue"
      :placeholder="inputPlaceholder"
      :suffix-icon="searchIcon"
      readonly
      @click="openDialog"
      @focus="handleInputFocus"
      @keydown.enter.prevent="openDialog"
      @keydown.space.prevent="openDialog"
    />
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
import { Search } from '@element-plus/icons-vue'
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
    searchIcon() {
      return Search
    },
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

      return this.selectedRows.map((item) => formatAssetLabel(item)).filter(Boolean).join(', ')
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
    handleInputFocus(event) {
      event?.target?.blur?.()
      this.openDialog()
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

.asset-select__input,
.asset-select :deep(.el-input),
.asset-select :deep(.el-input__wrapper) {
  width: 100% !important;
}

.asset-select :deep(.el-input__wrapper),
.asset-select :deep(.el-input__inner),
.asset-select :deep(.el-input__suffix) {
  cursor: pointer;
}

.asset-select :deep(.el-input__inner) {
  text-overflow: ellipsis;
}

.asset-select :deep(.el-input__suffix),
.asset-select :deep(.el-input__suffix-inner) {
  display: inline-flex !important;
  align-items: center;
  color: var(--color-text-placeholder);
}
</style>
