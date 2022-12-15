<template>
  <div class="asset-select-formatter">
    <Select2
      ref="select2"
      v-model="select2Config.value"
      v-bind="select2Config"
      @input="onInputChange"
      @focus.stop="handleFocus"
      v-on="$listeners"
    />
    <Dialog
      v-if="dialogVisible"
      :title="$tc('assets.Assets')"
      :visible.sync="dialogVisible"
      custom-class="asset-select-dialog"
      width="80vw"
      top="1vh"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <TreeTable
        ref="ListPage"
        class="tree-table"
        :tree-setting="treeSetting"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
    </Dialog>
  </div>
</template>

<script>
import TreeTable from '@/components/TreeTable'
import { DialogDetailFormatter } from '@/components/TableFormatters'
import Select2 from '@/components/FormFields/Select2'
import Dialog from '@/components/Dialog'

export default {
  componentName: 'AssetSelect',
  components: { TreeTable, Select2, Dialog },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    value: {
      type: Array,
      default: () => []
    },
    canSelect: {
      type: Function,
      default(row, index) {
        return true
      }
    },
    disabled: {
      type: [Boolean, Function],
      default: false
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
    const select2Config = {
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
    const vm = this
    return {
      dialogVisible: false,
      initialValue: _.cloneDeep(iValue),
      rowSelected: [],
      initSelection: null,
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showSearch: true,
        showAssets: false,
        url: this.baseUrl,
        nodeUrl: this.baseNodeUrl,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: `${this.baseNodeUrl}/children/tree/?assets=0`
      },
      select2Config: select2Config,
      dialogSelect2Config: select2Config,
      tableConfig: {
        url: this.baseUrl,
        hasTree: true,
        canSelect: this.canSelect,
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            sortable: true,
            showOverflowTooltip: true,
            formatter: DialogDetailFormatter,
            formatterArgs: {
              getDialogTitle: function({ col, row }) { this.$t('assets.AssetDetail') }.bind(this),
              getDetailItems: function({ col, row }) {
                return [
                  {
                    key: this.$t('assets.Name'),
                    value: row.name
                  },
                  {
                    key: this.$t('assets.AssetAddress'),
                    value: row.address
                  },
                  {
                    key: this.$t('assets.Protocols'),
                    value: row.protocols.map(item => item.name).join(', ')
                  },
                  {
                    key: this.$t('assets.Category'),
                    value: row.category.label
                  },
                  {
                    key: this.$t('assets.Type'),
                    value: row.type.label
                  },
                  {
                    key: this.$t('assets.Platform'),
                    value: row.platform?.name || ''
                  },
                  {
                    key: this.$t('common.Active'),
                    value: row.is_active
                  },
                  {
                    key: this.$t('assets.Comment'),
                    value: row.comment
                  }
                ]
              }.bind(this)
            }
          },
          {
            prop: 'address',
            label: this.$t('assets.ipDomain'),
            sortable: 'custom'
          },
          {
            prop: 'platform',
            label: this.$t('assets.Platform'),
            sortable: true,
            formatter: function(row) {
              return row.platform.name
            }
          },
          {
            prop: 'protocols',
            formatter: function(row) {
              const data = row.protocols.map(p => <el-tag size='mini'>{p.name}/{p.port} </el-tag>)
              return <span> {data} </span>
            },
            label: this.$t('assets.Protocols')
          }
        ],
        listeners: {
          'toggle-row-selection': (isSelected, row) => {
            if (isSelected) {
              vm.addRowToSelect(row)
            } else {
              vm.removeRowFromSelect(row)
            }
          }
        },
        theRowDefaultIsSelected: (row) => {
          return iValue.indexOf(row.id) > -1
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  },
  methods: {
    handleFocus() {
      this.$refs.select2.selectRef.blur()
      this.dialogVisible = true
    },
    handleConfirm() {
      this.dialogVisible = false
    },
    handleCancel() {
      this.$refs.select2.iValue = this.initialValue
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
          label: `${row.hostname}(${row.ip})`,
          value: row.id
        }
        options.push(option)
      }
    },
    addRowToSelect(row) {
      const outSelectOptions = this.$refs.select2.options
      this.addToSelect(outSelectOptions, row)

      const selectValue = this.$refs.select2.iValue
      const selectValueIndex = selectValue.indexOf(row.id)
      if (selectValueIndex === -1) {
        selectValue.push(row.id)
      }
      this.onInputChange(selectValue)
    },
    removeRowFromSelect(row) {
      const selectValue = this.$refs.select2.iValue
      const selectValueIndex = selectValue.indexOf(row.id)
      if (selectValueIndex > -1) {
        selectValue.splice(selectValueIndex, 1)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.el-select {
  width: 100%;
}

.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0;

  .tree-table {
    .left {
      padding: 5px;
    }

    .mini {
      padding-top: 8px;
    }

    .transition-box {
      padding: 5px;
    }
  }
}

.page ::v-deep .treebox {
  height: inherit !important;
}
</style>
