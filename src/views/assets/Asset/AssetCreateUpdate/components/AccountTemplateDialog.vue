<template>
  <div>
    <Dialog
      v-if="iVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="$tc('assets.SelectTemplate')"
      :visible.sync="iVisible"
      v-bind="$attrs"
      width="70%"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    >
      <template>
        <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
      </template>
    </Dialog>
    <CreateAccountTemplateDialog
      v-if="isShowCreate"
      :create-visible.sync="isShowCreate"
      @onPerform="onCreateTemplatePerform"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import CreateAccountTemplateDialog from './CreateAccountTemplateDialog'
import ListTable from '@/components/Table/ListTable/index.vue'

export default {
  name: 'AccountTemplateDialog',
  components: {
    Dialog,
    ListTable,
    CreateAccountTemplateDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object,
      default: () => {}
    },
    accounts: {
      type: Array,
      default: () => ([])
    },
    showCreate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const protocols = this.asset?.protocols?.map(i => i.name).toString() || ''
    return {
      isShowCreate: false,
      accountsSelected: [],
      tableConfig: {
        url: `/api/v1/accounts/account-templates/?protocols=${protocols}`,
        columns: ['name', 'username', 'secret_type', 'privileged'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'AccountTemplateDetail'
            }
          },
          privileged: {
            width: '100px'
          },
          actions: {
            has: false
          }
        },
        listeners: {
          'toggle-row-selection': (isSelected, row) => {
            if (isSelected) {
              this.addRowToSelect(row)
            } else {
              this.removeRowToSelect(row)
            }
          }
        },
        theRowDefaultIsSelected: (row) => {
          return this.accounts.some((account) => {
            return account.id === row.id
          })
        }
      },
      headerActions: {
        onCreate: () => {
          this.isShowCreate = true
        },
        hasCreate: this.showCreate,
        hasMoreActions: false,
        hasColumnSetting: false,
        hasImport: false,
        hasExport: false
      }
    }
  },
  computed: {
    refTable() {
      return this.$refs.listTable.$refs.dataTable.$refs.dataTable
    },
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    onCreateTemplatePerform() {
      this.refTable.getList()
    },
    handleConfirm() {
      this.iVisible = false
      // 过滤掉添加里还没有id的账号
      const templates = this.accounts.filter(i => i?.template).map(item => item.template)
      const newAddAccounts = this.accountsSelected.filter(i => {
        return templates.indexOf(i.id) === -1
      }).map(item => {
        return {
          template: item.id,
          name: item.name,
          username: item.username,
          secret_type: item.secret_type.value,
          privileged: item.privileged
        }
      })
      this.accounts.push(...newAddAccounts)
      this.$emit('onConfirm', this.accounts)
    },
    handleCancel() {
      this.iVisible = false
    },
    onAddClick() {
      this.isShowCreate = true
    },
    hasSelectValue(row) {
      return this.accountsSelected.some(item => item.id === row.id)
    },
    // 判断是否有相同类型的账号, 有则不允许选择
    hasSameTypeAccount(row) {
      const notIdAccounts = this.accounts.filter(i => !i?.id)
      const needFilterAccounts = [...notIdAccounts, ...this.accountsSelected]
      const status = needFilterAccounts.some(item => {
        return row.username === item.username && (
          row.secret_type.value === item.secret_type ||
          row.secret_type.value === item.secret_type.value
        )
      })
      if (status) {
        this.refTable.toggleRowSelection(row, false)
        this.$message.error(this.$tc('accounts.SameTypeAccountTip'))
      }
      return status
    },
    addRowToSelect(row) {
      const hasSelectValue = this.hasSelectValue(row)
      const hasSameTypeAccount = this.hasSameTypeAccount(row)
      if (!hasSelectValue && !hasSameTypeAccount) {
        this.accountsSelected.push(row)
      }
    },
    removeRowToSelect(row) {
      const hasSelectValue = this.hasSelectValue(row)
      if (hasSelectValue) {
        const index = this.accountsSelected.findIndex(i => i?.id === row.id)
        this.accountsSelected.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.actions {
  margin-bottom: 10px;

  .right {
    float: right;
    vertical-align: middle;
  }
}
</style>
