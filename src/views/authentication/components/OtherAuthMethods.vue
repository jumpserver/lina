<template>
  <div v-if="auth_methods.length !== 0" style="text-align: center">
    <el-divider content-position="center" color="#ff0000">{{ this.$t('auth.OtherAuthMethod') }}</el-divider>
    <div v-for="m in auth_methods" :key="m.name" style="display: inline-block">
      <el-link :underline="false" style="margin: 10px">
        <img :src="m.logo" height="15" width="15" style="vertical-align: middle">{{ m.name }}
      </el-link>
    </div>
  </div>
</template>

<script>

import store from '@/store'

export default {
  name: 'OtherAuthMethods',
  data() {
    return {
      auto_login: false,
      auto_login_days: store.getters.publicSettings.LOGIN_INFO.AUTO_LOGIN_DAYS,
      forgot_password_url: this.get_forgot_password_url(),
      auth_methods: store.getters.publicSettings.LOGIN_INFO.AUTH_METHODS
    }
  },
  created() {
  },
  methods: {
    get_forgot_password_url() {
      let url = store.getters.publicSettings.LOGIN_INFO.FORGOT_PASSWORD_URL
      if (!url) {
        url = '#/authentication/forget-password'
      }
      return url
    }
  }
}
</script>

<style lang="scss" scoped>
.el-divider {
  & >>> .el-divider__text {
    font-weight: normal;
    color: #676A6C;
    font-size: 13px;
  }
}
</style>
