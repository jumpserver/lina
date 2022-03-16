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
      statusMap: this.object.status === 'open' ? STATUS_MAP['notified'] : STATUS_MAP[this.object.state],
      imageUrl: require('@/assets/img/admin.png'),
      form: {
        comments: ''
      },
      comments: ''
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('tickets.Applicant'),
          value: this.object.applicant_display
        },
        {
          key: this.$t('tickets.type'),
          value: this.object.type_display
        },
        {
          key: this.$t('tickets.status'),
          value: this.object.status,
          formatter: (item, val) => {
            return <el-tag type={this.statusMap.type} size='mini'> { this.statusMap.title }</el-tag>
          }
        },
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        }
      ]
    },
    specialCardItems() {
      const vm = this
      return [
        {
          key: this.$t('tickets.ApplyRunUser'),
          value: this.object.meta.apply_run_user
        },
        {
          key: this.$t('tickets.ApplyRunAsset'),
          value: this.object.meta.apply_run_asset
        },
        {
          key: this.$t('tickets.ApplyRunSystemUser'),
          value: this.object.meta.apply_run_system_user
        },
        {
          key: this.$t('tickets.ApplyRunCommand'),
          value: this.object.meta.apply_run_command
        },
        {
          key: this.$t('tickets.ApplyFromSession'),
          value: this.object.meta.apply_from_session_id,
          formatter: function(item, value) {
            const to = { name: 'SessionDetail', params: { id: value }, query: { oid: vm.object.org_id }}
            if (!vm.$hasPerm('terminal.view_session')) {
              return <span>{vm.$t('sessions.session')}</span>
            }
            return <router-link to={to}>{vm.$t('sessions.session')}</router-link>
          }
        },
        {
          key: this.$t('tickets.ApplyFromCMDFilterRule'),
          value: {
            cmdFilterRuleId: this.object.meta.apply_from_cmd_filter_rule_id,
            cmdFilterId: this.object.meta.apply_from_cmd_filter_id
          },
          formatter: function(item, value) {
            const to = {
              name: 'CommandFilterRulesUpdate',
              params: { id: value.cmdFilterRuleId },
              query: { filter: value.cmdFilterId, oid: vm.object.org_id }
            }
            if (!vm.$hasPerm('assets.change_commandfilterrule')) {
              return <span>{vm.$t('assets.CommandFilterRules')}</span>
            }
            return <router-link to={to}>{vm.$t('assets.CommandFilterRules')}</router-link>
          }
        }
      ]
    }
  }
}
</script>

<style scoped>
</style>
