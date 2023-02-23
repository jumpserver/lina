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
        <div class="actions">
          <el-button
            v-if="showCreate"
            :disabled="!$hasPerm('accounts.add_accounttemplate')"
            size="small"
            type="primary"
            @click="onAddClick"
          >
            {{ $t('common.Add') }}
          </el-button>
          <div class="right">
            <el-button
              size="small"
              type="text"
              @click="refreshTable"
            >
              <el-tooltip :content="$tc('common.Refresh')" placement="top">
                <span>
                  <svg-icon icon-class="refresh" style="font-size: 14px;" />
                </span>
              </el-tooltip>
            </el-button>
          </div>
        </div>
        <AutoDataTable ref="dataTable" :config="tableConfig" />
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
import AutoDataTable from '@/components/AutoDataTable'
import CreateAccountTemplateDialog from './CreateAccountTemplateDialog'

export default {
  name: 'AccountTemplateDialog',
  components: {
    Dialog,
    AutoDataTable,
    CreateAccountTemplateDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
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
    return {
      isShowCreate: false,
      accountsSelected: [],
      tableConfig: {
        url: '/api/v1/accounts/account-templates/',
        columns: ['name', 'username', 'privileged'],
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
      }
    }
  },
  computed: {
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
    refreshTable() {
      this.$refs.dataTable.$refs.dataTable.getList()
    },
    onCreateTemplatePerform() {
      this.refreshTable()
    },
    handleConfirm() {
      this.iVisible = false
      // 过滤掉添加里还没有id的账号
      const hasIdAccounts = this.accounts.filter(i => i?.id).map(item => item.id)
      const newAddAccounts = this.accountsSelected.filter(i => {
        if (!hasIdAccounts.includes(i.id)) {
          i.template = true
          return i
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
        this.$refs.dataTable.$refs.dataTable.toggleRowSelection(row, false)
        this.$message.error(this.$t('accounts.SameTypeAccountTip'))
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
        this.accountsSelected.splice(hasSelectValue, 1)
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
