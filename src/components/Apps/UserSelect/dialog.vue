<template>
  <Dialog
    :close-on-click-modal="false"
    :title="$tc('Users')"
    custom-class="user-select-dialog"
    v-bind="$attrs"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    v-on="$listeners"
  >
    <ListTable
      ref="ListPage"
      :header-actions="headerActions"
      :sync-select-to-url="false"
      :table-config="tableConfig"
      :url="baseUrl"
      v-bind="$attrs"
      @loaded="handleTableLoaded"
      v-on="$listeners"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ListTable from '@/components/Table/ListTable'

export default {
  componentName: 'AssetSelectDialog',
  components: { Dialog, ListTable },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/users/users/?fields_size=small'
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
      isLoaded: false,
      dialogVisible: false,
      rowSelected: _.cloneDeep(this.value) || [],
      rowsAdd: [],
      tableConfig: {
        url: this.baseUrl,
        canSelect: this.canSelect,
        columns: [
          {
            prop: 'name',
            label: this.$t('Name'),
            sortable: true
          },
          {
            prop: 'username',
            label: this.$t('Username'),
            sortable: true
          },
          {
            prop: 'email',
            label: this.$t('Email'),
            sortable: true
          },
          {
            prop: 'mfa_level.label',
            label: this.$t('MfaLevel'),
            sortable: true,
            formatter: function(row) {
              return row.mfa_level.label
            }
          },
          {
            prop: 'source.label',
            label: this.$t('Source'),
            sortable: true,
            formatter: function(row) {
              return row.source.label
            }
          },
          {
            prop: 'org_roles.display_name',
            label: this.$t('OrgRoles'),
            sortable: true,
            formatter: function(row) {
              return row.org_roles.map(role => role.display_name).join(', ')
            }
          }
        ],
        columnsMeta: {
          actions: {
            has: false
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
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      }
    }
  },
  methods: {
    handleTableLoaded() {
      this.isLoaded = true
    },
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
.page ::v-deep .page-heading {
  display: none;
}

.user-select-dialog ::v-deep .el-icon-circle-check {
  display: none;
}
</style>
