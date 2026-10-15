<template>
  <div class="expire-notice-policy">
    <div>
      {{
        $t('GlobalExpireNoticePolicy', {
          first: firstNoticeDays,
          daily: dailyNoticeDays
        })
      }}
    </div>
    <div class="help">
      {{ $t('ControlledByGlobalSettings') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpireNoticePolicy',
  computed: {
    firstNoticeDays() {
      return this.$store.getters.publicSettings.PERM_EXPIRED_FIRST_NOTICE_DAYS
    },
    dailyNoticeDays() {
      return this.$store.getters.publicSettings.PERM_EXPIRED_DAILY_NOTICE_DAYS
    }
  }
}
</script>

<style lang="scss" scoped>
.expire-notice-policy {
  line-height: 1.6;

  .help {
    color: var(--el-text-color-secondary);
  }
}
</style>
