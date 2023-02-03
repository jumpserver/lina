<template>
  <div>
    <Dialog
      v-if="iVisible"
      :title="$tc('assets.SelectTemplate')"
      :visible.sync="iVisible"
      :destroy-on-close="true"
      width="70%"
      :close-on-click-modal="false"
      v-bind="$attrs"
      v-on="$listeners"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <template>
        <div class="actions">
          <el-button
            v-if="showCreate"
            type="primary"
            size="small"
            :disabled="!$hasPerm('accounts.view_accounttemplate')"
            @click="onAddClick"
          >
            {{ $t('common.Add') }}
          </el-button>
          <div class="right">
            <el-button
              type="text"
              size="small"
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
      v-on="$listeners"
      @onPerform="onCreateTemplatePerform"
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
        hasColumnActions: false,
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'AccountTemplateDetail'
            }
          },
          privileged: {
            width: '100px'
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
      const hasIdAccounts = this.accounts.filter(i => i?.id)
      const data = _.xorBy(hasIdAccounts, this.accountsSelected, 'id')
      this.accounts.push(...data)
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
    addRowToSelect(row) {
      const hasSelectValue = this.hasSelectValue(row)
      if (!hasSelectValue) {
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
