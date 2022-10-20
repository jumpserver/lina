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
          <el-form-item :label="this.$tc('assets.Name')">
            <el-input v-model="account['name']" readonly />
          </el-form-item>
          <el-form-item :label="this.$tc('assets.Username')">
            <el-input v-model="account['username']" readonly />
          </el-form-item>
          <el-form-item v-if="account['secret_type'] === 'password'" :label="this.$tc('assets.Password')">
            <el-input v-model="authInfo.secret" type="password" show-password />
          </el-form-item>
          <el-form-item v-else :label="this.$tc('assets.Key')">
            <el-input v-model="authInfo.secret" type="textarea" :rows="10" />
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
      dialogTitle: this.$tc('common.ViewSecret'),
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
