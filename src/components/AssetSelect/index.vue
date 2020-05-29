<template>
  <div class="asset-select-dialog">
    <Select2 ref="select2" v-bind="select2Config" @input="onInputChange" @focus.stop="handleFocus" v-on="$listeners" />
    <Dialog
      v-if="dialogVisible"
      :title="this.$t('assets.Assets')"
      :visible.sync="dialogVisible"
      custom-class="asset-select-dialog"
      width="70%"
      top="1vh"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <GenericTreeListPage
        ref="ListPage"
        :tree-setting="treeSetting"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
    </Dialog>
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { DetailFormatter } from '@/components/ListTable/formatters'
import { Select2, Dialog } from '@/components'

export default {
  componentName: 'AssetSelect',
  components: { GenericTreeListPage, Select2, Dialog },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const select2Config = {
      value: this.value,
      multiple: true,
      clearable: true,
      ajax: {
        url: '/api/v1/assets/assets/?fields_size=mini',
        processResults(data) {
          let results = data.results
          results = results.map((item) => {
            return { label: item.hostname + '(' + item.ip + ')', value: item.id }
          })
          const more = !!data.next
          return { results: results, pagination: more, total: data.count }
        }
      }
    }
    const vm = this
    return {
      dialogVisible: false,
      initialValue: _.cloneDeep(this.value),
      rowSelected: [],
      initSelection: null,
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/assets/?fields_size=mini',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      select2Config: select2Config,
      dialogSelect2Config: select2Config,
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            sortable: true,
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            }
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
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
          return this.value.indexOf(row.id) > -1
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
      this.$emit('input', val)
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
  .el-select{
    width: 100%;
  }
  .page /deep/ .page-heading{
    display: none;
  }
  .el-dialog__wrapper /deep/.el-dialog__body{
    padding: 5px 10px;
  }
  .page /deep/ .treebox{
    height: inherit !important;
  }
  .asset-select-dialog >>> .transition-box:first-child {
    background-color: #f3f3f3 ;
  }

  .el-dialog__wrapper /deep/.el-dialog__body .wrapper-content {
    padding: 10px;
  }

</style>
