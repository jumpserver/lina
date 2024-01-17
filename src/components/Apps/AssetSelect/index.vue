<template>
  <div class="asset-select-formatter">
    <Select2
      ref="select2"
      v-model="select2Config.value"
      v-bind="select2Config"
      @input="onInputChange"
      v-on="$listeners"
      @focus.stop="handleFocus"
    />
    <AssetSelectDialog
      v-if="dialogVisible"
      ref="dialog"
      :base-node-url="baseNodeUrl"
      :base-url="baseUrl"
      :tree-setting="treeSetting"
      :tree-url-query="treeUrlQuery"
      :value="value"
      :visible.sync="dialogVisible"
      v-bind="$attrs"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import AssetSelectDialog from './dialog.vue'
import { b } from 'css-color-function/lib/adjusters'

export default {
  componentName: 'AssetSelect',
  components: { AssetSelectDialog, Select2 },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrlQuery: {
      type: Object,
      default: () => {}
    },
    value: {
      type: Array,
      default: () => []
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const iValue = []
    for (const item of this.value) {
      if (typeof item === 'object') {
        iValue.push(item.id)
      } else {
        iValue.push(item)
      }
    }
    return {
      dialogVisible: false,
      initialValue: _.cloneDeep(iValue),
      select2Config: {
        value: iValue,
        multiple: true,
        clearable: true,
        ajax: {
          url: this.baseUrl,
          transformOption: (item) => {
            return { label: item.name + '(' + item.address + ')', value: item.id }
          }
        }
      }
    }
  },
  methods: {
    b,
    handleFocus() {
      this.$refs.select2.selectRef.blur()
      this.dialogVisible = true
    },
    handleConfirm(valueSelected, rowsAdd) {
      if (valueSelected === undefined) {
        return
      }
      this.$refs.select2.iValue = valueSelected
      this.addRowsToSelect(rowsAdd)
      this.onInputChange(valueSelected)
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    onInputChange(val) {
      this.$emit('change', val)
    },
    addToSelect(options, row) {
      const selectOptionsHas = options.find(item => item.value === row.id)
      // 如果select2的options中没有，那么可能无法显示正常的值
      if (selectOptionsHas === undefined) {
        const option = {
          label: `${row.name}(${row.address})`,
          value: row.id
        }
        options.push(option)
      }
    },
    addRowsToSelect(rows) {
      const outSelectOptions = this.$refs.select2.options
      for (const row of rows) {
        this.addToSelect(outSelectOptions, row)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
}

.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;

  .tree-table {
    .left {
      padding: 5px;

      .ztree {
        min-height: 500px;
        height: inherit !important;
      }
    }

    .mini {
      padding-top: 8px;
    }

    .transition-box {
      padding: 10px 5px;
    }
  }
}

.page ::v-deep .treebox {
  height: inherit !important;
}
</style>
