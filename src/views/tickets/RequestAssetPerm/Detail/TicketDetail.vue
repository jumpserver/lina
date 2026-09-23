<template><GenericTicketDetail :object="object" :special-card-items="specialCardItems" /></template>
<script>
import GenericTicketDetail from '../../components/GenericTicketDetail'
import { AccountLabelMapper } from '@/views/perms/const'
export default {
  components: { GenericTicketDetail },
  props: { object: { type: Object, required: true } },
  computed: {
    specialCardItems() {
      const { object } = this
      return [
        {
          key: this.$tc('Node'),
          value: object.apply_nodes.map((item) => item.name).join(', ')
        },
        {
          key: this.$tc('Asset'),
          value: object.apply_assets.map((item) => item.name).join(', ')
        },
        {
          key: this.$tc('Account'),
          value: object.apply_accounts.map((item) => AccountLabelMapper[item] || item).join(', ')
        },
        {
          key: this.$tc('Action'),
          value: object.apply_actions.map((item) => item.label).join(', ')
        },
        {
          key: this.$tc('DateStart'),
          value: object.apply_date_start
        },
        {
          key: this.$tc('DateExpired'),
          value: object.apply_date_expired
        },
        {
          key: this.$t('SystemExpireNotice'),
          value: this.getSystemExpireNoticeDescription()
        },
        {
          key: this.$t('ExpireSoonNotice'),
          value: this.getExpireNoticeDescription(object)
        }
      ]
    }
  },
  methods: {
    getExpireNoticeDescription(object) {
      if (
        object.apply_expire_soon_notice_minutes === null ||
        object.apply_expire_soon_notice_minutes === undefined
      ) {
        return this.$t('Disabled')
      }
      return `${object.apply_expire_soon_notice_minutes} ${this.$t('Minutes')}`
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
