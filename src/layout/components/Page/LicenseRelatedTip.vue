<template>
  <div v-if="!loading">
    <el-alert v-if="licenseMsg" type="error">
      {{ licenseMsg }} !
      <router-link :to="{ name: 'License' }" style="padding-left: 5px">
        {{ $t('common.View') }} <i class="fa fa-external-link" />
      </router-link>
    </el-alert>
  </div>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/common'
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
    ...mapGetters([
      'publicSettings',
      'currentUser'
    ]),
    licenseMsg() {
      if (this.expireMsg) {
        return this.expireMsg
      } else {
        return this.reachLimitsMsg
      }
    },
    expireMsg() {
      if (!this.publicSettings['XPACK_ENABLED'] || !this.$hasPerm('settings.change_license')) {
        return false
      }
      const intervalDays = this.getIntervalDays(this.licenseData.date_expired)
      if (intervalDays < 0) {
        return this.$t('setting.LicenseExpired')
      }
      if (intervalDays < 7) {
        return this.$t('setting.LicenseWillBe') + this.licenseData.date_expired + this.$t('setting.Expire')
      }
      return false
    },
    reachLimitsMsg() {
      if (!this.publicSettings['XPACK_ENABLED'] || !this.$hasPerm('settings.change_license')) {
        return false
      }
      if (this.licenseData.corporation === 'FIT2CLOUD') {
        return this.$t('setting.LicenseForTest')
      }
      if (this.licenseData['current_asset_count'] > this.licenseData.asset_count) {
        return this.$t('setting.LicenseReachedAssetAmountLimit')
      }
      return false
    }
  },
  mounted() {
    if (this.publicSettings['XPACK_ENABLED'] && this.$hasPerm('settings.change_license')) {
      this.$axios.get('/api/v1/xpack/license/detail').then(res => {
        this.licenseData = res
      }).finally(() => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
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
