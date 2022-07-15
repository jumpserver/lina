<template>
  <div class="accounts">
    <el-table :data="accounts" style="width: 100%">
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="protocol" label="协议" />
      <el-table-column prop="type" label="类型" />
      <el-table-column fixed="right" align="right" label="操作" width="135" class-name="buttons">
        <template slot-scope="scope">
          <el-button type="danger" icon="el-icon-minus" size="mini" @click="removeAccount(scope.row)" />
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <el-button size="mini" type="primary" @click="showAddDialog">添加</el-button>
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
      default: () => ['ssh']
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
      account: null,
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
      account._id = this.accounts.length + 1
      this.accounts.push(account)
      this.visible = false
    },
    removeAccount(account) {
      this.accounts = this.accounts.filter((item) => {
        return item._id !== account._id
      })
    },
    editAccount(account) {
      this.accounts.splice(account._id, 1, account)
      this.visible = false
    },
    showEditDialog(account) {
      this.account = account
      this.visible = true
    },
    showAddDialog() {
      this.account = null
      this.visible = true
    }
  }
}
</script>

<style scoped lang="scss">
.accounts >>> .buttons .cell {
  padding-right: 2px;
}
</style>
