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
      <router-link v-if="canModify" :to="settingsRoute">
        {{ $t('ModifyGlobalSettings') }}
      </router-link>
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
    },
    canModify() {
      return (
        this.$hasPerm('settings.change_security') &&
        this.$hasPerm('settings.change_ops') &&
        this.$hasPerm('ops.view_celerytask')
      )
    },
    settingsRoute() {
      return {
        name: 'TaskDetail',
        params: { id: 'perms.tasks.check_asset_permission_will_expired' }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.expire-notice-policy {
  line-height: 1.6;

  .help {
    color: var(--el-text-color-secondary);

    a {
      margin-left: 8px;
      color: var(--el-color-primary);
    }
  }
}
</style>
