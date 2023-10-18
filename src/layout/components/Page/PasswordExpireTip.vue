<template>
  <div>
    <el-alert v-if="expireMsg" type="error">
      {{ expireMsg }}
    </el-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PasswordExpireTip',
  data() {
    return {
      loading: true,
      securityData: {}
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings',
      'currentUser'
    ]),
    expireMsg() {
      // 用户来源不是Local时不显示密码过期提示
      if (this.currentUser.source.value !== 'local') {
        return false
      }
      const intervalTime = this.getIntervalDays(this.currentUser.date_password_last_updated)
      const securityPasswordExpirationTime = this.publicSettings.SECURITY_PASSWORD_EXPIRATION_TIME
      if (intervalTime >= securityPasswordExpirationTime) {
        return this.$t('users.passwordExpired')
      }
      if (securityPasswordExpirationTime - intervalTime <= 5) {
        return this.$t('users.passwordWillExpiredPrefixMsg') +
          (securityPasswordExpirationTime - intervalTime) +
          this.$t('users.passwordWillExpiredSuffixMsg')
      }
      return false
    }
  },
  methods: {
    getIntervalDays(date) {
      date = new Date(date)
      const dateExpired = this.$moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
      const dateNow = this.$moment(new Date()).format('YYYY-MM-DD')
      return this.$moment(dateNow).diff(this.$moment(dateExpired), 'days')
    }
  }
}
</script>

<style scoped>

</style>
