<template>
  <div>
    <el-alert v-if="isExpire" type="error">
      {{ isExpire }}
    </el-alert>
  </div>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/common'
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
    isExpire() {
      // 用户来源不是Local时不显示密码过期提示
      if (this.currentUser.source !== 'local') {
        return false
      }
      const intervalTime = this.getIntervalDays(this.currentUser.date_password_last_updated)
      const securityPasswordExpirationTime = this.publicSettings.SECURITY_PASSWORD_EXPIRATION_TIME
      if (intervalTime >= securityPasswordExpirationTime) {
        return this.$t('users.passwordExpired')
      }
      if (securityPasswordExpirationTime - intervalTime <= 5) {
        return this.$t('users.passwordWillExpiredPrefixMsg') + (securityPasswordExpirationTime - intervalTime) + this.$t('users.passwordWillExpiredSuffixMsg')
      }
      return false
    }
  },
  methods: {
    getIntervalDays(date) {
      const dateExpired = new Date(toSafeLocalDateStr(date))
      const dateNow = new Date()
      const intervalTime = dateNow.getTime() - dateExpired.getTime()
      return Math.floor(intervalTime / (24 * 3600 * 1000))
    }
  }
}
</script>

<style scoped>

</style>
