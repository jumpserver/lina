<template>
  <Dialog
    :title="$tc('common.User')"
    custom-class="user-select-dialog"
    top="1vh"
    v-bind="$attrs"
    width="70vw"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    v-on="$listeners"
  >
    <ListTable
      ref="ListTable"
      :table-config="iTableConfig"
      :header-actions="iHeaderActions"
      class="list-table"
      v-bind="$attrs"
    />
  </Dialog>
</template>

<script>
import ListTable from '../../Table/ListTable/index.vue'
import Dialog from '../../Dialog/index.vue'
import { mapGetters } from 'vuex'

export default {
  components: { ListTable, Dialog },
  props: {
    url: {
      type: String,
      default: '/api/v1/users/users/'
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
    },
    tableConfig: {
      type: Object,
      default: () => {}
    },
    headerActions: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      dialogVisible: false,
      rowSelected: _.cloneDeep(this.value) || [],
      rowsAdd: [],
      defaultTableConfig: {
        url: this.url,
        canSelect: this.canSelect,
        columnsShow: {
          min: ['name', 'username'],
          default: [
            'name', 'username', 'system_roles',
            'org_roles', 'is_valid'
          ]
        },
        columnsMeta: {
          system_roles: {
            formatter: (row) => {
              return row['system_roles'].map(item => item['display_name']).join(', ') || '-'
            }
          },
          org_roles: {
            formatter: (row) => {
              return row['org_roles'].map(item => item['display_name']).join(', ') || '-'
            },
            has: () => {
              return this.$store.getters.hasValidLicense && !this.currentOrgIsRoot
            }
          }
        },
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
      defaultHeaderActions: {
        hasLeftActions: false,
        hasRightActions: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    iTableConfig() {
      const obj = Object.assign(this.defaultTableConfig, this.tableConfig)
      return obj
    },
    iHeaderActions() {
      const obj = Object.assign(this.defaultHeaderActions, this.headerActions)
      return obj
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

<style lang="scss" scoped>
.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 10px 5px;
}
</style>
