<template>
  <div v-if="!loading">
    <el-alert v-if="isExpire" type="error">
      {{ isExpire }}
    </el-alert>
    <el-alert v-if="reachedAssetAmountLimit" type="error">
      {{ reachedAssetAmountLimit }}
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
    isExpire() {
      if (!this.publicSettings.XPACK_ENABLED || !this.$hasPerm('settings.change_license')) {
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
    reachedAssetAmountLimit() {
      if (!this.publicSettings.XPACK_ENABLED || !this.$hasPerm('settings.change_license')) {
        return false
      }
      if (this.licenseData['current_asset_count'] > this.licenseData.asset_count) {
        return this.$t('setting.LicenseReachedAssetAmountLimit')
      }
      return false
    }
  },
  mounted() {
    if (this.publicSettings.XPACK_ENABLED && this.$hasPerm('settings.change_license')) {
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
