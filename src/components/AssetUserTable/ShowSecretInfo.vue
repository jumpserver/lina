<template>
  <div>
    <Dialog
      :title="dialogTitle"
      :visible.sync="showDialog"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'50'"
    >
      <div v-if="MFAConfirmed">
        <el-form label-position="right" label-width="80px" :model="MFAInfo">
          <el-form-item :label="this.$t('assets.Hostname')">
            <el-input v-model="assetUser.hostname" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="assetUser.username" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Password')">
            <el-input v-model="password" type="password" show-password />
          </el-form-item>
        </el-form>
      </div>
      <el-row v-else :gutter="20">
        <el-col :span="4">
          <div style="line-height: 34px;text-align: center">MFA</div>
        </el-col>
        <el-col :span="14">
          <el-input v-model="MFAInput" />
          <span class="help-tips help-block">{{ $t('common.MFARequireForSecurity') }}</span>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" style="line-height:20px " @click="MFAConfirm">
            {{ this.$t('common.Confirm') }}
          </el-button>
        </el-col>
      </el-row>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'ShowSecretInfo',
  components: {
    Dialog
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    assetUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      MFAConfirmed: false,
      MFAInput: '',
      dialogTitle: this.$t('common.ViewSecret'),
      password: ''
    }
  },
  methods: {
    MFAConfirm() {
      if (this.MFAInput.length !== 6) {
        return this.$message.error(this.$t('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAInput
        }
      ).then(res => {
        this.$store.dispatch('users/setMFAVerify')
        const authInfoUrl = `/api/v1/assets/asset-user-auth-infos/${this.assetUser.asset}/`
        this.$axios.get(authInfoUrl).then(res => {
          this.MFAConfirmed = true
          this.password = res['password']
        })
      })
    },
    handleMFAConfirm() {
      this.MFAInfo = {
        asset: '',
        username: '',
        hostname: '',
        password: ''
      }
      this.MFAInput = ''
      this.showMFADialog = false
      this.MFAConfirmed = false
    }
  }
}
</script>

<style scoped>

</style>
