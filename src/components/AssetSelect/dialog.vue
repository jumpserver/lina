<template>
  <Dialog
    :title="$tc('assets.Assets')"
    custom-class="asset-select-dialog"
    top="1vh"
    v-bind="$attrs"
    width="80vw"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    v-on="$listeners"
  >
    <AssetTreeTable
      ref="ListPage"
      :header-actions="headerActions"
      :table-config="tableConfig"
      class="tree-table"
    />
  </Dialog>
</template>

<script>
import AssetTreeTable from '@/components/AssetTreeTable'
import Dialog from '@/components/Dialog'

export default {
  componentName: 'AssetSelectDialog',
  components: { AssetTreeTable, Dialog },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
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
    const vm = this
    return {
      dialogVisible: false,
      rowSelected: _.cloneDeep(this.value) || [],
      rowsAdd: [],
      tableConfig: {
        url: this.baseUrl,
        hasTree: true,
        hasColumnActions: false,
        canSelect: this.canSelect,
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            sortable: true
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
              const data = row.protocols.map(p => {
                return <el-tag size='mini'>{p.name}/{p.port} </el-tag>
              })
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
          return this.value.indexOf(row.id) > -1
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm', this.rowSelected, this.rowsAdd)
    },
    handleCancel() {
      this.$emit('cancel')
    },
    addRowToSelect(row) {
      const selectValueIndex = this.rowSelected.indexOf(row.id)
      if (selectValueIndex === -1) {
        this.rowSelected.push(row.id)
        this.rowsAdd.push(row)
      }
    },
    removeRowFromSelect(row) {
      const selectValueIndex = this.rowSelected.indexOf(row.id)
      if (selectValueIndex > -1) {
        this.rowSelected.splice(selectValueIndex, 1)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;

  .tree-table {
    .search {
      .el-input__inner {
        background-color: #f3f3f3;
      }

      .el-cascader {
        background-color: #f3f3f3;
      }
    }

    .left {
      padding: 5px;

      .treebox {
        height: 70vh;
      }
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
