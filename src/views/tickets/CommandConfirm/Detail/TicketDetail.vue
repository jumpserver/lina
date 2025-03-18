<template>
  <div>
    <GenericTicketDetail :object="object" :special-card-items="specialCardItems" />

    <Drawer
      :title="this.$t('Session')"
      :visible.sync="drawerVisible"
      :has-footer="false"
      :component="SessionDetail"
    />
  </div>
</template>

<script>
import { STATUS_MAP } from '../../const'
import Drawer from '@/components/Drawer/index.vue'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'

export default {
  name: 'CommandConfirmTicketDetail',
  components: {
    Drawer,
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
      drawerVisible: false,
      SessionDetail: () => import('@/views/sessions/SessionDetail'),
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
          key: this.$t('ApplyRunUser'),
          value: object.rel_snapshot.apply_run_user
        },
        {
          key: this.$t('ApplyRunAsset'),
          value: object.apply_run_asset
        },
        {
          key: this.$t('Account'),
          value: object.apply_run_account
        },
        {
          key: this.$t('ApplyRunCommand'),
          value: object.apply_run_command
        },
        {
          key: this.$t('ApplyFromSession'),
          value: object.apply_from_session,
          formatter: (_item, value) => {
            if (!this.$hasPerm('terminal.view_session')) {
              return <span>{this.$t('Session')}</span>
            }

            this.handleSideEffect(value)
            return <el-link>{this.$t('Session')}</el-link>
          }
        },
        {
          key: this.$t('ApplyFromCMDFilterRule'),
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
              return <span>{this.$t('CommandFilterRules')}</span>
            }
            return <router-link to={to}>{this.$t('CommandFilterRules')}</router-link>
          }
        }
      ]
    }
  },
  methods: {
    handleSideEffect(value) {
      this.$route.params.id = value.id
      this.$route.query.oid = this.object.org_id

      this.$nextTick(() => {
        this.drawerVisible = true
      })
    }
  }
}
</script>
