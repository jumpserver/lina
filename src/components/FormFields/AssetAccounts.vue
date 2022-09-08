<template>
  <div class="accounts">
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
      <el-button size="mini" type="success" @click="onAddClick">模版添加</el-button>
    </div>
    <Dialog
      v-if="visible"
      :title="this.$tc('assets.AddAccount')"
      :visible.sync="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      width="70%"
    >
      <AccountCreateForm
        :protocols="protocols"
        :account="account"
        @add="addAccount"
        @edit="editAccount"
      />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import AccountCreateForm from '@/components/AccountCreateForm'
export default {
  name: 'AssetAccounts',
  components: {
    Dialog,
    AccountCreateForm
  },
  props: {
    protocols: {
      type: Array,
      default: () => []
    },
    value: {
      type: [Array],
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      accounts: [],
      account: {},
      initial: false
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
    addAccount(account) {
      const i = this.accounts.findIndex(item => item.username === account.username)
      if (i !== -1) {
        this.accounts.splice(i, 1)
      }
      this.accounts.push(account)
      this.visible = false
    },
    removeAccount(account) {
      this.accounts = this.accounts.filter((item) => {
        return item._id !== account._id
      })
    },
    editAccount(form) {
      const i = this.accounts.findIndex(item => item.username === this.account.username)
      this.accounts.splice(i, 1, form)
      this.visible = false
    },
    onEditClick(account) {
      this.account = account
      setTimeout(() => {
        this.visible = true
      })
    },
    onAddClick() {
      this.account = null
      setTimeout(() => {
        this.visible = true
      })
    }
  }
}
</script>

<style scoped lang="scss">
.accounts >>> .buttons .cell {
  padding-right: 2px;
}
</style>
