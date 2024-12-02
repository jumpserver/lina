<template>
  <div>
    <el-link v-if="isUpdate(this)" :underline="false" type="default" @click="goToAssetAccountsPage()">
      {{ $t('InAssetDetail') }}
    </el-link>
    <div v-else class="accounts el-data-table">
      <el-table :data="accounts" class="el-table--fit el-table--border">
        <el-table-column :label="$tc('Name')" prop="name" />
        <el-table-column :label="$tc('Username')" prop="username" />
        <el-table-column :label="$tc('Privileged')" prop="privileged">
          <template v-slot="scope">
            <i v-if="scope.row['privileged']" class="fa fa-check text-primary" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$tc('TemplateAdd')" prop="template">
          <template v-slot="scope">
            <i v-if="scope.row['template']" class="fa fa-check text-primary" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$tc('Actions')" align="center" class-name="buttons" fixed="right" width="135">
          <template v-slot="scope">
            <el-button icon="el-icon-minus" size="mini" type="danger" @click="removeAccount(scope.row)" />
            <el-button
              :disabled="!!scope.row.template"
              icon="el-icon-edit"
              size="mini"
              type="primary"
              @click="onEditClick(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <div class="actions">
        <el-button size="mini" type="primary" @click="onAddClick">
          {{ $t('Add') }}
        </el-button>
        <el-button
          :disabled="!$hasPerm('accounts.view_accounttemplate')"
          size="mini"
          type="success"
          @click="onAddFromTemplateClick"
        >
          {{ $t('TemplateAdd') }}
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

    <el-drawer
      direction="btt"
      size="50%"
      :with-header="false"
      :append-to-body="true"
      :visible.sync="pamDrawerShow"
    >
      <component :is="drawerRefName" />
    </el-drawer>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import AddAccountDialog from './AddAccountDialog'
import AssetDetail from '@/views/assets/Asset/AssetDetail'
import AccountTemplateDialog from './AccountTemplateDialog'

export default {
  name: 'AssetAccounts',
  components: {
    Drawer,
    AssetDetail,
    AddAccountDialog,
    AccountTemplateDialog
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
    const accounts = this.value || []
    return {
      accounts: accounts,
      drawerRefName: null,
      account: {},
      pamDrawerShow: false,
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
            tab: 'Accounts'
          }
        })
        return
      }

      if (this.$route.query.type === 'pam') {
        this.pamDrawerShow = true
        this.drawerRefName = AssetDetail

        this.$route.params.id = assetId
        this.$route.query.tab = 'Account'

        return
      }

      this.$router.push({
        name: 'AssetDetail',
        params: { id: assetId },
        query: {
          tab: 'Account'
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-data-table ::v-deep .el-table {
  .table {
    margin-top: 15px;
  }

  .el-table__row {
    &.selected-row {
      background-color: #f5f7fa;
    }

    & > td {
      line-height: 1.5;
      padding: 6px 0;
      font-size: 13px;
      border-right: none;

      * {
        vertical-align: middle;
      }

      .el-checkbox {
        vertical-align: super;
      }

      & > div > span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .el-table__header > thead > tr > th {
    padding: 6px 0;
    background-color: #ffffff;
    font-size: 13px;
    line-height: 1.5;
    border-right: none;

    .cell {
      white-space: nowrap !important;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        border-right: 2px solid #EBEEF5;
      }
    }
  }
}

.el-data-table ::v-deep .el-table .el-table__header > thead > tr .is-sortable {
  padding: 5px 0;

  .cell {
    padding-top: 3px !important;
  }
}

::v-deep .page.tab-page {
  .page-heading .el-row--flex {
    flex-wrap: wrap;

    .page-heading-left .el-button {
      display: none;
    }
  }

  .tab-page-content {
    overflow: auto;
    height: 100%;
  }
}
</style>
