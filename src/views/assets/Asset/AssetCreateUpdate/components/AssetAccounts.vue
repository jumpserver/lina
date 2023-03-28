<template>
  <div>
    <el-link v-if="isUpdate(this)" :underline="false" type="default" @click="goToAssetAccountsPage()">
      {{ $t('assets.InAssetDetail') }}
    </el-link>
    <div v-else class="accounts">
      <el-table :data="accounts" style="width: 100%">
        <el-table-column :label="$tc('assets.Username')" prop="username" width="180" />
        <el-table-column :label="$tc('assets.Privileged')" prop="privileged">
          <template v-slot="scope">
            <i :class="scope.row['privileged'] ? 'fa-check' : ''" class="fa text-primary" />
          </template>
        </el-table-column>
        <el-table-column :label="$tc('common.Actions')" align="right" class-name="buttons" fixed="right" width="135">
          <template v-slot="scope">
            <el-button icon="el-icon-minus" size="mini" type="danger" @click="removeAccount(scope.row)" />
            <el-button :disabled="scope.row.template" icon="el-icon-edit" size="mini" type="primary" @click="onEditClick(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <div class="actions">
        <el-button size="mini" type="primary" @click="onAddClick">
          {{ $t('common.Add') }}
        </el-button>
        <el-button :disabled="!$hasPerm('accounts.view_accounttemplate')" size="mini" type="success" @click="onAddFromTemplateClick">
          {{ $t('common.TemplateAdd') }}
        </el-button>
      </div>
      <AddAccountDialog
        :account="account"
        :accounts="accounts"
        :platform="platform"
        :visible.sync="addAccountDialogVisible"
      />
      <AccountTemplateDialog
        v-if="templateDialogVisible"
        :accounts="accounts"
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
      accounts: this.value || [],
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
        if (account.id && item.id) {
          return item.id !== account.id
        } else if (account.username && item.username) {
          return item.username !== account.username
        } else {
          return account.name !== item.name
        }
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
    },
    goToAssetAccountsPage() {
      const assetId = this.$route.params.id
      // todo: 临时解决方案，后续需要优化 发布机的组织是 system，所以需要判断一下，否则
      // 会跳转到其他组织的资产详情页，而不是发布机详情页
      if (this.$router.currentRoute.name === 'AppletHostUpdate') {
        this.$router.push({
          name: 'AppletHostDetail',
          params: { id: assetId },
          query: {
            activeTab: 'Accounts'
          }
        })
        return
      }
      this.$router.push({
        name: 'AssetDetail',
        params: { id: assetId },
        query: {
          activeTab: 'Account'
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.accounts >>> .buttons .cell {
  padding-right: 2px;
}
</style>
