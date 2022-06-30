<template>
  <GenericTicketDetail :object="object" :detail-card-items="detailCardItems" :special-card-items="specialCardItems" />
</template>

<script>
import { STATUS_MAP } from '../../const'
import { toSafeLocalDateStr } from '@/utils/common'
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
      statusMap: this.object.status === 'open' ? STATUS_MAP['pending'] : STATUS_MAP[this.object.state],
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      const { object } = this
      return [
        {
          key: this.$t('tickets.Applicant'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('tickets.type'),
          value: object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(object.date_created)
        }
      ]
    },
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
          key: this.$t('tickets.ApplyRunSystemUser'),
          value: object.rel_snapshot.apply_run_system_user
        },
        {
          key: this.$t('tickets.ApplyRunCommand'),
          value: object.apply_run_command
        },
        {
          key: this.$t('tickets.ApplyFromSession'),
          value: object.apply_from_session,
          formatter: function(item, value) {
            const to = { name: 'SessionDetail', params: { id: value }, query: { oid: object.org_id }}
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
