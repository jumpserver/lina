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
      <div>
        <el-form label-position="right" label-width="80px" :model="authInfo">
          <el-form-item :label="this.$t('assets.Name')">
            <el-input v-model="account.asset.name" readonly />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="account['username']" readonly />
          </el-form-item>
          <el-form-item v-if="secretTypePassword" :label="this.$t('assets.Password')">
            <ShowKeyCopyFormatter v-model="authInfo.secret" />
          </el-form-item>
          <el-form-item v-else :label="this.$t('users.SSHKey')">
            <el-input v-model="authInfo['private_key']" class="item-textarea" type="textarea" show-password readonly />
          </el-form-item>
          <el-form-item :label="this.$t('common.DateCreated')">
            <span>{{ $moment(authInfo.date_created, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') }}</span>
          </el-form-item>
          <el-form-item :label="this.$t('common.DateUpdated')">
            <span>{{ $moment(authInfo.date_updated, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') }}</span>
          </el-form-item>
          <el-form-item :label="this.$t('accounts.PasswordRecord')">
            <span>{{ authInfo.version }}</span>
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserConfirmDialog from '@/components/UserConfirmDialog'
import { ShowKeyCopyFormatter } from '@/components/TableFormatters'

export default {
  name: 'ShowSecretInfo',
  components: {
    Dialog,
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
      dialogTitle: this.$t('common.ViewSecret'),
      authInfo: {},
      showAuthInfo: false,
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
        this.showAuthInfo = true
      })
    },
    exit() {
      this.$emit('update:visible', false)
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
</style>
