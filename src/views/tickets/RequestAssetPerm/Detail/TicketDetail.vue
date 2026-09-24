<template><GenericTicketDetail :object="object" :special-card-items="specialCardItems" /></template>
<script>
import GenericTicketDetail from '../../components/GenericTicketDetail'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      const { object } = this
      return [
        ...(object.request_items || [])
          .filter((item) => item.name !== 'apply_expire_soon_notice_minutes')
          .map((item) => ({
            key: item.name === 'apply_users' ? this.$t('TicketAuthorizedUsers') : item.label,
            value: Array.isArray(item.value) ? item.value.join(', ') : (item.value ?? '-')
          })),
        {
          key: this.$t('SystemExpireNotice'),
          value: this.getSystemExpireNoticeDescription()
        },
        {
          key: this.$t('ExpireSoonNotice'),
          value: this.getExpireNoticeDescription(
            (object.request_items || []).find(
              (item) => item.name === 'apply_expire_soon_notice_minutes'
            )?.value
          )
        }
      ]
    }
  },
  methods: {
    getExpireNoticeDescription(minutes) {
      if (minutes === null || minutes === undefined) {
        return this.$t('Disabled')
      }
      return `${minutes} ${this.$t('Minutes')}`
    },
    getSystemExpireNoticeDescription() {
      const settings = this.$store.getters.publicSettings
      return [
        this.$t('GlobalExpireNoticePolicy', {
          first: settings.PERM_EXPIRED_FIRST_NOTICE_DAYS,
          daily: settings.PERM_EXPIRED_DAILY_NOTICE_DAYS
        }),
        this.$t('ControlledByGlobalSettings')
      ].join('; ')
    }
  }
}
</script>
