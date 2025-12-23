<template>
  <div>
    <Dialog
      v-if="visible"
      :close-on-click-modal="false"
      :confirm-title="$tc('Add')"
      :destroy-on-close="true"
      :model="false"
      :title="$tc('SelectTemplate')"
      :visible="visible"
      v-bind="$attrs"
      width="800px"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    >
      <template>
        <ListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
      </template>
    </Dialog>
    <CreateAccountTemplateDialog
      v-if="isShowCreate"
      v-model:create-visible="isShowCreate"
      @on-perform="onCreateTemplatePerform"
      v-on="$listeners"
    />
  </div>
</template>

<script lang="jsx">
import Dialog from '@/components/Dialog'
import CreateAccountTemplateDialog from './CreateAccountTemplateDialog'
import { DrawerListTable as ListTable } from '@/components'

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
      default: () => {
      }
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
  emits: ['update:visible', 'onConfirm'],
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
            formatter: (row) => <span>{row.name}</span>
            // 暂禁用远程应用中账号模板的详情跳转
            // formatterArgs: {
            //   route: 'AccountTemplateDetail'
            // }
          },
          privileged: {
            width: '120px'
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
      return this.$refs.listTable.$refs.ListTable.$refs.dataTable.$refs.dataTable
    }
  },
  methods: {
    onCreateTemplatePerform() {
      this.refTable.getList()
    },
    handleConfirm() {
      this.$emit('update:visible', false)
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
      this.$emit('update:visible', false)
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
        this.$message.error(this.$tc('SameTypeAccountTip'))
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
