<template>
  <div>
    <el-select ref="select" v-model="internalValue" multiple placeholder="请选择资产" @focus="handleFocus" />
    <el-dialog
      :title="this.$t('Assets')"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="60%"
    >
      <GenericTreeListPage
        ref="ListPage"
        :tree-setting="treeSetting"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { DetailFormatter } from '@/components/ListTable/formatters'
export default {
  componentName: 'AssetSelect',
  components: { GenericTreeListPage },
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
        showMenu: true,
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
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AssetDetail'
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          }
        ]
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: true,
        hasRightActions: false
      }
    }
  },
  computed: {

  },
  mounted() {
    this.$on('SelectionChange', (val) => {
      // 对象循环
      this.internalValue = []
      this.showValue = []
      for (const key in val) {
        this.internalValue.push(`${val[key].hostname}(${val[key].ip})`)
        this.showValue.push(`${val[key].id}`)
      }

      this.$emit('input', this.showValue)
      this.$emit('getAsset', this.showValue)
    })
  },
  methods: {
    clearSelected() {
      this.internalValue = []
      this.showValue = []
    },
    handleFocus() {
      this.$refs.select.blur()
      this.dialogVisible = true
    },
    handleConfirm() {
      this.dialogVisible = false
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {
        })
    }
  }
}
</script>

<style lang='less' scoped>
  .el-select{
    width: 100%;
  }
  .page /deep/ .page-heading{
    display: none;
  }
  .el-dialog__wrapper /deep/.el-dialog__body{
    padding: inherit !important;
  }
  .page /deep/ .treebox{
    height: inherit !important;
  }
</style>
