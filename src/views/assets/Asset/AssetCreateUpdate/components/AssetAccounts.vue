<template>
  <div>
    <div v-if="isUpdate(this)">
      在资产详情中更新账号信息
    </div>
    <div v-else class="accounts">
      <el-table :data="accounts" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="privileged" label="特权账号">
          <template v-slot="scope">
            <i class="fa text-primary" :class="scope.row['privileged'] ? 'fa-check' : ''" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="right" label="操作" width="135" class-name="buttons">
          <template v-slot="scope">
            <el-button type="danger" icon="el-icon-minus" size="mini" @click="removeAccount(scope.row)" />
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="onEditClick(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <div class="actions">
        <el-button size="mini" type="primary" @click="onAddClick">添加</el-button>
        <el-button size="mini" type="success" @click="onAddFromTemplateClick">模版添加</el-button>
      </div>
      <AddAccountDialog
        :visible.sync="addAccountDialogVisible"
        :platform="platform"
        :account="account"
        :accounts="accounts"
      />
      <AccountTemplateDialog
        :visible.sync="templateDialogVisible"
      />
    </div>
  </div>
</template>

<script>
import AccountTemplateDialog from './AccountTemplateDialog'
import AddAccountDialog from './AddAccountDialog'
export default {
  name: 'AssetAccounts',
  components: {
    AccountTemplateDialog,
    AddAccountDialog
  },
  props: {
    platform: {
      type: Object,
      default: () => ({})
    },
    value: {
      type: [Array],
      default: () => []
    },
    isUpdate: {
      type: Function,
      default: (vm) => {
        return vm.$route.params.id
      }
    }
  },
  data() {
    return {
      accounts: [],
      account: {},
      initial: false,
      addAccountDialogVisible: false,
      templateDialogVisible: false
    }
  },
  watch: {
    accounts: {
      handler(value) {
        if (value.length > 0 || this.initial) {
          this.$emit('input', value)
        }
        if (value) {
          this.initial = true
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    removeAccount(account) {
      this.accounts = this.accounts.filter((item) => {
        return item._id !== account._id
      })
    },
    onEditClick(account) {
      this.account = account
      setTimeout(() => {
        this.addAccountDialogVisible = true
      })
    },
    onAddClick() {
      this.account = null
      setTimeout(() => {
        this.addAccountDialogVisible = true
      })
    },
    onAddFromTemplateClick() {
      this.templateDialogVisible = true
    },
    onSelectTemplate() {
    }
  }
}
</script>

<style scoped lang="scss">
.accounts >>> .buttons .cell {
  padding-right: 2px;
}
</style>
