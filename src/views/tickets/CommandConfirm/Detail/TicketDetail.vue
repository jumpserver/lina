<template>
  <GenericTicketDetail :object="object" :special-card-items="specialCardItems" />
</template>

<script>
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'

export default {
  name: 'CommandConfirmTicketDetail',
  components: {
    GenericTicketDetail
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statusMap: this.object.status.value === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state.value],
      imageUrl: require('@/assets/img/avatar.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    specialCardItems() {
      const { object } = this
      return [
        {
          key: this.$t('tickets.ApplyRunUser'),
          value: object.rel_snapshot.apply_run_user
        },
        {
          key: this.$t('tickets.ApplyRunAsset'),
          value: object.apply_run_asset
        },
        {
          key: this.$t('assets.Account'),
          value: object.apply_run_account
        },
        {
          key: this.$t('tickets.ApplyRunCommand'),
          value: object.apply_run_command
        },
        {
          key: this.$t('tickets.ApplyFromSession'),
          value: object.apply_from_session,
          formatter: function(item, value) {
            const to = { name: 'SessionDetail', params: { id: value?.id }, query: { oid: object.org_id }}
            if (!this.$hasPerm('terminal.view_session')) {
              return <span>{this.$t('sessions.session')}</span>
            }
            return <router-link to={to}>{this.$t('sessions.session')}</router-link>
          }
        },
        {
          key: this.$t('tickets.ApplyFromCMDFilterRule'),
          value: {
            cmdFilterRuleId: object.apply_from_cmd_filter_rule,
            cmdFilterId: object.apply_from_cmd_filter
          },
          formatter: function(item, value) {
            const to = {
              name: 'CommandFilterRulesUpdate',
              params: { id: value.cmdFilterRuleId },
              query: { filter: value.cmdFilterId, oid: object.org_id }
            }
            if (!this.$hasPerm('assets.change_commandfilterrule')) {
              return <span>{this.$t('assets.CommandFilterRules')}</span>
            }
            return <router-link to={to}>{this.$t('assets.CommandFilterRules')}</router-link>
          }
        }
      ]
    }
  }
}
</script>

<style scoped>
</style>
