<template>
  <div>
    <Dialog
      v-bind="$attrs"
      v-model:visible="showSecret"
      :destroy-on-close="true"
      :show-cancel="false"
      :title="iTitle"
      width="720px"
      @confirm="accountConfirmHandle"
    >
      <el-form :model="secretInfo" class="password-form" label-position="right" label-width="130px">
        <el-form-item :label="$tc('Name')">
          <span>{{ account['name'] }}</span>
        </el-form-item>
        <el-form-item :label="$tc('Username')">
          <span>{{ account['username'] }}</span>
        </el-form-item>
        <el-form-item :label="secretTypeLabel">
          <el-tooltip
            v-if="vaultUnavailable"
            :content="$t('VaultSecretUnavailableTip')"
            placement="top"
          >
            <span class="vault-secret-unavailable">
              <i class="fa fa-exclamation-circle" />
              {{ $t('VaultSecretUnavailable') }}
            </span>
          </el-tooltip>
          <SecretViewerFormatter
            v-else
            :cell-value="secretInfo.secret"
            :col="{
              formatterArgs: {
                name: account['name'],
                secretType: secretType || ''
              }
            }"
            @input="onShowKeyCopyFormatterChange"
          />
        </el-form-item>
        <el-form-item v-if="secretType === 'ssh_key'" :label="`${$tc('SshKeyFingerprint')} (MD5)`">
          <span>{{ sshKeyFingerprint }}</span>
        </el-form-item>
        <el-form-item
          v-if="secretType === 'ssh_key'"
          :label="`${$tc('SshKeyFingerprint')} (SHA256)`"
        >
          <span>{{ sshKeyFingerprintSha256 }}</span>
        </el-form-item>
        <el-form-item :label="$tc('DateCreated')">
          <span>{{ toSafeLocalDateStr(account['date_created']) }}</span>
        </el-form-item>
        <el-form-item :label="$tc('DateUpdated')">
          <span>{{ toSafeLocalDateStr(account['date_updated']) }}</span>
        </el-form-item>
        <el-form-item
          v-if="showPasswordRecord && $hasPerm('accounts.view_accountsecret')"
          :label="$tc('PasswordRecord')"
        >
          <el-link underline="never" type="success" @click="showHistoryDialog">
            <span style="padding-right: 30px">
              {{ versions }}
            </span>
          </el-link>
        </el-form-item>
      </el-form>
    </Dialog>
    <PasswordHistoryDialog
      v-if="showPasswordHistoryDialog"
      v-model:visible="showPasswordHistoryDialog"
      :account="account"
    />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { SecretViewerFormatter } from '@/components/Table/TableFormatters'
import { useDateTime } from '@/composables/useDateTime'
import { encryptPassword } from '@/utils/secure'
import PasswordHistoryDialog from './PasswordHistoryDialog.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ShowSecretInfo',
  components: {
    Dialog,
    PasswordHistoryDialog,
    SecretViewerFormatter
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'account'
    },
    title: {
      type: String,
      default: ''
    },
    showPasswordRecord: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      modifiedSecret: '',
      secretInfo: {},
      versions: '-',
      showSecret: false,
      vaultUnavailable: false,
      mfaDialogVisible: true,
      sshKeyFingerprint: '-',
      sshKeyFingerprintSha256: '-',
      historyCount: 0,
      iTitle: this.title || this.$tc('Detail'),
      showPasswordHistoryDialog: false
    }
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    }),
    secretTypeLabel() {
      return this.account['secret_type'].label || 'Password'
    },
    secretType() {
      return this.account['secret_type'].value
    }
  },
  setup() {
    return useDateTime()
  },
  async mounted() {
    if (this.showPasswordRecord) {
      const url = `/api/v1/accounts/account-secrets/${this.account.id}/histories/?limit=1`
      try {
        const resp = await this.$axios.get(url, { disableFlashErrorMsg: true })
        this.versions = resp.count
      } catch (error) {
        // The secret request below displays a dedicated Vault status when applicable.
      }
    }
    this.showSecretDialog()
  },
  methods: {
    accountConfirmHandle() {
      this.modifiedSecret && this.onChangeSecretSubmit()
      this.showSecret = false
      this.mfaDialogVisible = false
    },
    onChangeSecretSubmit() {
      const params = {
        name: this.secretInfo.name,
        secret: encryptPassword(this.modifiedSecret)
      }
      const url =
        this.type === 'account' ? `/api/v1/accounts/accounts` : `/api/v1/accounts/account-templates`
      this.$axios.patch(`${url}/${this.account.id}/`, params).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    },
    showSecretDialog() {
      if (this.publicSettings.SECURITY_DISABLE_VIEW_SECRET) {
        this.$message.warning(this.$tc('AccountSecretReadDisabled'))
        return
      }
      return this.$axios
        .get(this.url, { disableFlashErrorMsg: true })
        .then((res) => {
          this.vaultUnavailable = false
          this.secretInfo = res
          this.sshKeyFingerprint = res?.spec_info?.ssh_key_fingerprint || '-'
          this.sshKeyFingerprintSha256 = res?.spec_info?.ssh_key_fingerprint_sha256 || '-'
          this.showSecret = true
        })
        .catch((error) => {
          if (error?.response?.data?.code !== 'vault_unavailable') {
            throw error
          }
          this.vaultUnavailable = true
          this.showSecret = true
        })
    },
    exit() {
      this.$emit('update:visible', false)
    },
    showHistoryDialog() {
      this.showPasswordHistoryDialog = true
    },
    onShowKeyCopyFormatterChange(value) {
      if (value === this.secretInfo.secret) return
      this.modifiedSecret = value
    }
  }
}
</script>

<style lang="scss" scoped>
.item-textarea :deep(.el-textarea__inner) {
  height: 110px;
}

.vault-secret-unavailable {
  color: var(--el-color-warning);

  .fa {
    margin-right: 4px;
  }
}

.el-form-item {
  border-bottom: 1px solid #ebeef5;
  padding: 5px 0;
  margin-bottom: 0;

  &:last-child {
    border-bottom: none;
  }

  :deep(.el-form-item__label) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-right: 20px;
    line-height: 30px;
    word-break: keep-all;
    overflow-wrap: break-word;
    white-space: normal;
  }

  :deep(.el-form-item__content) {
    line-height: 30px;

    pre {
      margin: 0;
    }
  }
}

ul {
  margin: 0;
}

li {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .title {
    color: #303133;
    font-weight: 500;
  }
}
</style>
