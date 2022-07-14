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
          <el-form-item :label="this.$t('assets.Hostname')">
            <el-input v-model="account.hostname" readonly />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="account['username']" readonly />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Password')">
            <el-input v-model="authInfo.password" type="password" show-password />
          </el-form-item>
          <el-form-item :label="this.$t('users.SSHKey')">
            <el-input v-model="authInfo['private_key']" class="item-textarea" type="textarea" show-password />
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserConfirmDialog from '@/components/UserConfirmDialog'
export default {
  name: 'ShowSecretInfo',
  components: {
    Dialog,
    UserConfirmDialog
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

<style scoped>
  .item-textarea >>> .el-textarea__inner {
    height: 110px;
  }
</style>
