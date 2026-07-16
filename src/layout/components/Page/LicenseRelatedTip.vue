<template>
  <el-alert v-if="!loading && licenseMsg" type="error">
    {{ licenseMsg }} !
    <router-link :to="{ name: 'License' }" style="padding-left: 5px">
      {{ $t('View') }} <i class="fa fa-external-link" />
    </router-link>
  </el-alert>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LicenseRelatedTip',
  data() {
    return {
      loading: true,
      licenseData: {}
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentUser']),
    licenseMsg() {
      if (this.jdmcMsg) {
        return this.jdmcMsg
      } else if (this.expireMsg) {
        return this.expireMsg
      } else {
        return this.reachLimitsMsg
      }
    },
    jdmcMsg() {
      if (!this.publicSettings['XPACK_ENABLED'] || !this.$hasPerm('settings.change_license')) {
        return false
      }
      if (this.licenseData.message === 'license_expired') {
        return this.$t('LicenseExpired')
      }
      if (this.licenseData.message === 'license_maintenance_expired') {
        return this.$t('LicenseMaintenanceExpired')
      }
      if (this.licenseData.message === 'license_will_expire') {
        return this.$t('LicenseWillExpire')
      }
      return false
    },
    expireMsg() {
      if (!this.publicSettings['XPACK_ENABLED'] || !this.$hasPerm('settings.change_license')) {
        return false
      }
      const intervalDays = this.getIntervalDays(this.licenseData.date_expired)
      if (intervalDays < 0) {
        return this.$t('LicenseExpired')
      }
      if (intervalDays < 7) {
        return (
          this.$t('LicenseWillBe') + ' ' + this.licenseData.date_expired + ' ' + this.$t('Expire')
        )
      }
      return false
    },
    reachLimitsMsg() {
      if (!this.publicSettings['XPACK_ENABLED'] || !this.$hasPerm('settings.change_license')) {
        return false
      }
      if (this.licenseData.corporation === 'FIT2CLOUD') {
        return this.$t('LicenseForTest')
      }
      if (this.licenseData['current_asset_count'] > this.licenseData.asset_count) {
        return this.$t('LicenseReachedAssetAmountLimit')
      }
      return false
    }
  },
  mounted() {
    if (this.publicSettings['XPACK_ENABLED'] && this.$hasPerm('settings.change_license')) {
      this.$axios
        .get('/api/v1/xpack/license/detail')
        .then((res) => {
          this.licenseData = res
        })
        .finally(() => {
          this.loading = false
        })
    } else {
      this.loading = false
    }
  },
  methods: {
    getIntervalDays(date) {
      const dateExpired = new Date(date)
      const dateNow = new Date()
      // 只保留年月日，去掉时分秒
      const expiredDay = new Date(
        dateExpired.getFullYear(),
        dateExpired.getMonth(),
        dateExpired.getDate()
      )

      const nowDay = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate())

      const intervalTime = expiredDay.getTime() - nowDay.getTime()
      return Math.floor(intervalTime / (24 * 3600 * 1000))
    }
  }
}
</script>

<style scoped></style>
