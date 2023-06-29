<template>
  <div>
    <el-checkbox v-model="auto_login" style="color: #737373">
      {{ auto_login_days }} {{ this.$t('auth.DaysAutoLogin') }}
    </el-checkbox>
    <el-link type="primary" :underline="false" :href="forgot_password_url" style="float: right;">
      {{ this.$t('route.ForgetPassword') }}
    </el-link>
  </div>
</template>

<script>

import store from '@/store'

export default {
  name: 'AutoLogin',
  data() {
    return {
      auto_login: false,
      auto_login_days: store.getters.publicSettings.LOGIN_INFO.AUTO_LOGIN_DAYS,
      forgot_password_url: this.get_forgot_password_url()
    }
  },
  created() {
  },
  methods: {
    get_forgot_password_url() {
      const url = store.getters.publicSettings.LOGIN_INFO.FORGOT_PASSWORD_URL
      return url || '/ui/#/authentication/forget-password'
    }
  }
}
</script>

<style scoped>
</style>
