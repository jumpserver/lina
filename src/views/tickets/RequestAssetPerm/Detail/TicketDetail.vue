<template><GenericTicketDetail :object="object" :special-card-items="specialCardItems" /></template>
<script>
import { h } from 'vue'
import GenericTicketDetail from '../../components/GenericTicketDetail'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      const { object } = this
      const source = object.source_ticket
      return [
        ...(source
          ? [
              {
                key: this.$t('TicketSource'),
                value: source.serial_num,
                formatter: (_item, value) =>
                  source.can_view
                    ? h(
                        'a',
                        {
                          href: this.$router.resolve({
                            name: 'AssetsTicketDetail',
                            params: { id: source.id },
                            query: { oid: source.org_id }
                          }).href,
                          target: '_blank',
                          rel: 'noopener'
                        },
                        value
                      )
                    : value
              }
            ]
          : []),
        ...(object.request_items || [])
          .filter((item) => item.name !== 'apply_expire_soon_notice_minutes')
          .map((item) => ({
            name: item.name,
            key: item.name === 'apply_users' ? this.$t('TicketAuthorizedUsers') : item.label,
            value: ['apply_date_start', 'apply_date_expired'].includes(item.name)
              ? toSafeLocalDateStr(item.value)
              : (item.value ?? '-')
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
