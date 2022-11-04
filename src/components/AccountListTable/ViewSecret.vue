<template>
  <div>
    <UserConfirmDialog
      :url="url"
      @UserConfirmDone="getAuthInfo"
      @UserConfirmCancel="exit"
    />
    <Dialog
      :title="dialogTitle"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'50'"
      :visible.sync="showAuthInfo"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-form class="password-form" label-position="right" label-width="80px" :model="authInfo">
        <el-form-item :label="this.$t('assets.Name')">
          <ShowKeyCopyFormatter v-model="account.asset.name" />
        </el-form-item>
        <el-form-item :label="this.$tc('assets.Username')">
          <ShowKeyCopyFormatter v-model="account.username" />
        </el-form-item>
        <el-form-item v-if="secretTypePassword" :label="this.$t('assets.Password')">
          <ShowKeyCopyFormatter v-model="authInfo.secret" />
        </el-form-item>
        <div v-else>
          <el-form-item :label="this.$t('assets.SSHSecretKey')">
            <ShowKeyCopyFormatter v-model="authInfo.secret" :has-show="false" />
          </el-form-item>
          <el-form-item :label="this.$t('assets.sshKeyFingerprint')">
            <span>{{ sshKeyFingerprint }}</span>
            <el-button type="text" @click="onDownload">{{ $t('common.Download') }}</el-button>
          </el-form-item>
        </div>
        <el-form-item :label="this.$t('common.DateCreated')">
          <span>{{ $moment(authInfo.date_created, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') }}</span>
        </el-form-item>
        <el-form-item :label="this.$t('common.DateUpdated')">
          <span>{{ $moment(authInfo.date_updated, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') }}</span>
        </el-form-item>
        <el-form-item :label="this.$t('accounts.PasswordRecord')">
          <el-button type="text" @click="onShowPasswordHistory">{{ authInfo.version }}</el-button>
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
import Dialog from '@/components/Dialog'
import PasswordHistoryDialog from './PasswordHistoryDialog'
import UserConfirmDialog from '@/components/UserConfirmDialog'
import { ShowKeyCopyFormatter } from '@/components/TableFormatters'
import { downloadFile } from '@/utils/common.js'

export default {
  name: 'ShowSecretInfo',
  components: {
    Dialog,
    PasswordHistoryDialog,
    UserConfirmDialog,
    ShowKeyCopyFormatter
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogTitle: this.$tc('common.ViewSecret'),
      authInfo: {},
      showAuthInfo: false,
      sshKeyFingerprint: '',
      showPasswordHistoryDialog: false,
      url: `/api/v1/assets/account-secrets/${this.account.id}/`
    }
  },
  computed: {
    secretTypePassword() {
      return this.authInfo.secret_type === 'password'
    }
  },
  methods: {
    getAuthInfo() {
      this.$axios.get(this.url, { disableFlashErrorMsg: true }).then(resp => {
        this.authInfo = resp
        this.sshKeyFingerprint = resp.specific.ssh_key_fingerprint
        this.showAuthInfo = true
      })
    },
    exit() {
      this.$emit('update:visible', false)
    },
    onShowPasswordHistory() {
      this.showPasswordHistoryDialog = true
    },
    onDownload() {
      const { secret, secret_type } = this.authInfo || {}
      downloadFile(secret, secret_type + '.key')
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-textarea >>> .el-textarea__inner {
    height: 110px;
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
  .password-form >>> .el-form-item {
    margin-bottom: 4px;
  }
</style>
