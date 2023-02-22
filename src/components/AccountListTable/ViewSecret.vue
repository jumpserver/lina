<template>
  <div>
    <UserConfirmDialog
      :url="url"
      @UserConfirmCancel="exit"
      @UserConfirmDone="getAuthInfo"
    />
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :title="title"
      :visible.sync="showSecret"
      :width="'50'"
      v-bind="$attrs"
      @confirm="showSecret = false"
      v-on="$listeners"
    >
      <el-form :model="secretInfo" class="password-form" label-position="right" label-width="100px">
        <div v-if="!onlyShowPassword">
          <el-form-item :label="$tc('assets.Name')">
            <span>{{ account['name'] }}</span>
          </el-form-item>
          <el-form-item :label="$tc('assets.Username')">
            <span>{{ account['username'] }}</span>
          </el-form-item>
        </div>
        <el-form-item :label="secretTypeLabel">
          <ShowKeyCopyFormatter
            :cell-value="secretInfo.secret"
            :col="{ formatterArgs: {
              name: account['name'],
            }}"
          />
        </el-form-item>
        <el-form-item v-if="showPasswordRecord" :label="$tc('accounts.PasswordRecord')">
          <el-button
            v-perms="'accounts.view_historyaccountsecret'"
            type="text"
            @click="onShowPasswordHistory"
          >
            {{ historyCount }}
          </el-button>
        </el-form-item>
        <div v-if="!onlyShowPassword">
          <el-form-item v-if="secretType === 'ssh_key'" :label="$tc('assets.sshKeyFingerprint')">
            <span>{{ sshKeyFingerprint }}</span>
          </el-form-item>
          <el-form-item :label="$tc('common.DateCreated')">
            <span>{{ account['date_created'] | date }}</span>
          </el-form-item>
          <el-form-item :label="$tc('common.DateUpdated')">
            <span>{{ account['date_updated'] | date }}</span>
          </el-form-item>
        </div>
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
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: function() {
        return this.$tc('assets.AccountDetail')
      }
    },
    showPasswordRecord: {
      type: Boolean,
      default: true
    },
    onlyShowPassword: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      secretInfo: {},
      showSecret: false,
      sshKeyFingerprint: '',
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
    const url = `/api/v1/accounts/account-secrets/${this.account.id}/histories/?limit=1`
    this.$axios.get(url,
      {
        validateStatus: (status) => {
          if (status === 400) return 200
          return status
        }
      }
    ).then(resp => {
      this.historyCount = resp.count
    })
  },
  methods: {
    getAuthInfo() {
      this.$axios.get(this.url, { disableFlashErrorMsg: true }).then(resp => {
        this.secretInfo = resp
        this.sshKeyFingerprint = resp?.spec_info
        this.showSecret = true
      })
    },
    exit() {
      this.$emit('update:visible', false)
    },
    onShowPasswordHistory() {
      this.showPasswordHistoryDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-textarea >>> .el-textarea__inner {
    height: 110px;
  }

  .el-form-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 5px 0;
    margin-bottom: 0;

    &:last-child {
      border-bottom: none;
    }

    >>> .el-form-item__label {
      padding-right: 20px;
      line-height: 30px;
    }

    >>> .el-form-item__content {
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
