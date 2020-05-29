<template>
  <div class="asset-select-dialog">
    <Select2 ref="select2" v-model="value" multiple :placeholder="placeholder" v-bind="$attrs" @focus="handleFocus" />
    <el-dialog
      :title="this.$t('assets.Assets')"
      :visible.sync="dialogVisible"
      custom-class="asset-select-dialog"
      width="70%"
    >
      <GenericTreeListPage
        ref="ListPage"
        :tree-setting="treeSetting"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('common.Cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ $t('common.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { DetailFormatter } from '@/components/ListTable/formatters'
import { Select2 } from '@/components'

export default {
  componentName: 'AssetSelect',
  components: { GenericTreeListPage, Select2 },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalValue: [],
      showValue: [],
      dialogVisible: false,
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        defaultSelect: this.value,
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
        ]
      },
      headerActions: {
        hasRightSide: false,
        hasSearch: true,
        hasRightActions: false
      }
    }
  },
  computed: {
    placeholder() {
      return '请选择'
    }
  },
  mounted() {
    console.log('Initial value', this.value)
    // this.$on('SelectionChange', (val) => {
    //   // 对象循环
    //   this.internalValue = []
    //   this.showValue = []
    //   for (const key in val) {
    //     this.internalValue.push(`${val[key].hostname}(${val[key].ip})`)
    //     this.showValue.push(`${val[key].id}`)
    //   }

    this.$emit('input', this.showValue)
    this.$emit('getAsset', this.showValue)
    // })
  },
  methods: {
    clearSelected() {
      this.internalValue = []
      this.showValue = []
    },
    handleFocus() {
      this.$refs.select2.selectRef.blur()
      this.dialogVisible = true
    },
    handleConfirm() {
      this.dialogVisible = false
    },
    handleClose(done) {
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
