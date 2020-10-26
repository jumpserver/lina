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
      const datePasswordLastUpdatedTime = new Date(toSafeLocalDateStr(this.currentUser.date_password_last_updated))
      const dateNow = new Date()
      const intervalTime = Math.floor((dateNow.getTime() - datePasswordLastUpdatedTime.getTime()) / (24 * 3600 * 1000))
      const securityPasswordExpirationTime = this.publicSettings.SECURITY_PASSWORD_EXPIRATION_TIME
      if (securityPasswordExpirationTime > intervalTime) {
        if (securityPasswordExpirationTime - intervalTime < 7) {
          return '快过期了'
        }
      }

      // const securityPasswordExpirationTime = this.publicSettings.SECURITY_PASSWORD_EXPIRATION_TIME
      return true
    }
    //   if (!this.publicSettings.XPACK_ENABLED || this.currentUser.role !== 'Admin') {
    //     return false
    //   }
    //   const intervalDays = this.getIntervalDays(this.licenseData.date_expired)
    //   if (intervalDays < 0) {
    //     return this.$t('setting.LicenseExpired')
    //   }
    //   if (intervalDays < 7) {
    //     return this.$t('setting.LicenseWillBe') + this.licenseData.date_expired + this.$t('setting.Expire')
    //   }
    //   return false
    // }
  },
  methods: {
    getIntervalDays(date) {
      const dateExpired = new Date(toSafeLocalDateStr(date))
      const dateNow = new Date()
      const intervalTime = dateExpired.getTime() - dateNow.getTime()
      return Math.floor(intervalTime / (24 * 3600 * 1000))
    }
  }
}
</script>

<style scoped>

</style>
