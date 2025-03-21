<template>
  <div>
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :title="title"
      :visible.sync="showSecret"
      :width="'50'"
      v-bind="$attrs"
      @confirm="accountConfirmHandle"
      v-on="$listeners"
    >
      <el-form :model="secretInfo" class="password-form" label-position="right" label-width="130px">
        <el-form-item :label="$tc('Name')">
          <span>{{ account['name'] }}</span>
        </el-form-item>
        <el-form-item :label="$tc('Username')">
          <span>{{ account['username'] }}</span>
        </el-form-item>
        <el-form-item :label="secretTypeLabel">
          <SecretViewerFormatter
            :cell-value="secretInfo.secret"
            :col="{ formatterArgs: {
              name: account['name'],
              secretType: secretType || ''
            }}"
            @input="onShowKeyCopyFormatterChange"
          />
        </el-form-item>
        <el-form-item v-if="secretType === 'ssh_key'" :label="$tc('SshKeyFingerprint')">
          <span>{{ sshKeyFingerprint }}</span>
        </el-form-item>
        <el-form-item :label="$tc('DateCreated')">
          <span>{{ account['date_created'] | date }}</span>
        </el-form-item>
        <el-form-item :label="$tc('DateUpdated')">
          <span>{{ account['date_updated'] | date }}</span>
        </el-form-item>
        <el-form-item v-if="showPasswordRecord" v-perms="'accounts.view_accountsecret'" :label="$tc('PasswordRecord')">
          <el-link
            :underline="false"
            type="success"
            @click="showHistoryDialog"
          >
            <span style="padding-right: 30px">
              {{ versions }}
            </span>
          </el-link>
        </el-form-item>
      </el-form>
    </Dialog>
    <PasswordHistoryDialog
      v-if="showPasswordHistoryDialog"
      :account="account"
      :visible.sync="showPasswordHistoryDialog"
    />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import PasswordHistoryDialog from './PasswordHistoryDialog.vue'
import { SecretViewerFormatter } from '@/components/Table/TableFormatters'
import { encryptPassword } from '@/utils/crypto'

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
      default: function() {
        return this.$tc('Detail')
      }
    },
    showPasswordRecord: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      modifiedSecret: '',
      secretInfo: {},
      versions: '-',
      showSecret: false,
      mfaDialogVisible: true,
      sshKeyFingerprint: '-',
      historyCount: 0,
      showPasswordHistoryDialog: false
    }
  },
  computed: {
    secretTypeLabel() {
      return this.account['secret_type'].label || 'Password'
    },
    secretType() {
      return this.account['secret_type'].value
    }
  },
  mounted() {
    if (this.showPasswordRecord) {
      const url = `/api/v1/accounts/account-secrets/${this.account.id}/histories/?limit=1`
      this.$axios.get(url, { disableFlashErrorMsg: true }).then(resp => {
        this.versions = resp.count
        this.showSecretDialog()
      })
    } else {
      this.showSecretDialog()
    }
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
      const url = this.type === 'account' ? `/api/v1/accounts/accounts` : `/api/v1/accounts/account-templates`
      this.$axios.patch(`${url}/${this.account.id}/`, params).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    },
    showSecretDialog() {
      return this.$axios.get(this.url, { disableFlashErrorMsg: true }).then((res) => {
        this.secretInfo = res
        this.sshKeyFingerprint = res?.spec_info?.ssh_key_fingerprint || '-'
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
  .item-textarea ::v-deep .el-textarea__inner {
    height: 110px;
  }

  .el-form-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 5px 0;
    margin-bottom: 0;

    &:last-child {
      border-bottom: none;
    }

    ::v-deep .el-form-item__label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-right: 20px;
      line-height: 30px;
      word-break: keep-all;
      overflow-wrap: break-word;
      white-space: normal;
    }

    ::v-deep .el-form-item__content {
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
