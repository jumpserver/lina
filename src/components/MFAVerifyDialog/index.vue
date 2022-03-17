<template>
  <Dialog
    :title="$t('common.MFAVerify')"
    :width="'50'"
    :show-confirm="false"
    :show-cancel="false"
    :visible.sync="visible"
    :destroy-on-close="true"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div style="line-height: 34px;text-align: center">MFA</div>
      </el-col>
      <el-col :md="14" :sm="24">
        <el-input v-model="MFAToken" />
        <span class="help-tips help-block">{{ $t('common.MFARequireForSecurity') }}</span>
      </el-col>
      <el-col :md="4" :sm="24">
        <el-button size="mini" type="primary" style="line-height:20px " @click="verifyMFA">
          {{ this.$t('common.Confirm') }}
        </el-button>
      </el-col>
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  name: 'MFAVerifyDialog',
  components: {
    Dialog
  },
  data() {
    return {
      MFAToken: '',
      visible: false
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$emit('MFAVerifyCancel', true)
      }
    }
  },
  mounted() {
    this.$axios.get('/api/v1/authentication/otp/verify/', { disableFlashErrorMsg: true }).then(() => {
      this.$emit('MFAVerifyDone', true)
    }).catch(err => {
      this.$log.debug('Verify otp code error: ', err)
      this.visible = true
    })
  },
  methods: {
    verifyMFA() {
      if (this.MFAToken.length !== 6) {
        return this.$message.error(this.$tc('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAToken
        }
      ).then(res => {
        this.$emit('MFAVerifyDone', true)
      })
    }
  }
}
</script>

<style scoped>

</style>
