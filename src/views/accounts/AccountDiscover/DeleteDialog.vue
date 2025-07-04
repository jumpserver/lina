<template>
  <div>
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :title="$tc('DeleteGatherAccountTitle')"
      :visible.sync="iVisible"
      v-bind="$attrs"
      width="600px"
      @confirm="handleConfirm"
      v-on="$listeners"
    >
      <el-alert type="error" :closable="closeable">
        {{ this.$t('DeleteWarningMsg') }} {{ account.username }}({{ account.asset.name }}) ?

        <div class="extra-delete">
          <div v-if="hasDeleteAccount && assetAccounts.length > 0" class="delete-item">
            <el-checkbox v-model="iDeleteAccount">
              <!-- 发现资产账号列表中，存在该账号，是否同步删除 ? -->
              {{ this.$t('FoundAccountInAssetDeleteMsg') }} ?
            </el-checkbox>
            <ul>
              <li v-for="item in assetAccounts" :key="item.id">
                <router-link
                  :to="{
                    name: 'AssetAccountDetail',
                    params: { id: item.id }
                  }"
                  target="_blank"
                >
                  {{ item.name }}({{ item.username }}) - {{ account.asset.name }}
                </router-link>
              </li>
            </ul>
          </div>

          <div v-if="hasDeleteRemote && account.present" class="delete-item">
            <el-checkbox v-model="iDeleteRemote">
              {{ this.$t('RemoteAssetFoundAccountDeleteMsg') }} ?
              <!-- 远端主机上存在该账号，是否要同步删除 ? -->
            </el-checkbox>
          </div>
        </div>
      </el-alert>
    </Dialog>
    <RemoveAccount
      v-if="removeAccountTask.visible"
      :accounts="removeAccountTask.accounts"
      :visible.sync="removeAccountTask.visible"
    />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import RemoveAccount from '@/components/Apps/AccountListTable/RemoveAccount.vue'

export default {
  name: 'DeleteAccount',
  components: {
    Dialog,
    RemoveAccount
  },
  props: {
    account: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    hasDeleteRemote: {
      type: Boolean,
      default: true
    },
    defaultDeleteRemote: {
      type: Boolean,
      default: false
    },
    hasDeleteAccount: {
      type: Boolean,
      default: true
    },
    defaultDeleteAccount: {
      type: Boolean,
      default: false
    },
    closeable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      removeAccountTask: {
        visible: false,
        accounts: []
      },
      iDeleteRemote: this.defaultDeleteRemote,
      iDeleteAccount: this.defaultDeleteAccount,
      assetAccounts: []
    }
  },
  computed: {
    iVisible: {
      set(item) {
        this.$emit('update:visible', item)
      },
      get() {
        return this.visible
      }
    }
  },
  mounted() {
    if (this.account.id) {
      this.getAssetAccount()
    }
  },
  methods: {
    getAssetAccount() {
      const url = '/api/v1/accounts/accounts/'
      this.$axios.get(url, {
        params: {
          username: this.account.username,
          asset: this.account.asset.id,
          fields_size: 'mini'
        }
      }).then(res => {
        this.assetAccounts = res
      })
    },
    handleConfirm() {
      const url = `/api/v1/accounts/gathered-accounts/${this.account.id}/`
      this.$axios.delete(url, {
        params: {
          username: this.account.username,
          asset: this.account.asset.id,
          is_delete_account: this.iDeleteAccount,
          is_delete_remote: this.iDeleteRemote
        }
      }).then(res => {
        this.$message.success(this.$tc('DeleteSuccessMsg'))
        this.$emit('deleted', res)
        setTimeout(() => {
          this.iVisible = false
        }, 100)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.extra-delete {
  .delete-item {
    margin-top: 20px;
  }

  ::v-deep {
    .el-checkbox__label {
      font-size: 12px;
    }
  }
}
</style>
