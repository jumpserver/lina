<template>
  <div>
    <GenericTicketDetail :object="object" :special-card-items="specialCardItems" />

    <Drawer
      v-model:visible="drawerVisible"
      :title="$t('Session')"
      :has-footer="false"
      :component="SessionDetail"
    />
  </div>
</template>

<script>
import {
  isVNode as isVNodeCompat,
  resolveComponent as resolveComponentCompat,
  createVNode as createVNodeCompat
} from 'vue'
import { STATUS_MAP } from '../../const'
import Drawer from '@/components/Drawer/index.vue'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import { getAssetUrl } from '@/utils/assets'
function _isSlot(s) {
  return (
    typeof s === 'function' ||
    (Object.prototype.toString.call(s) === '[object Object]' && !isVNodeCompat(s))
  )
}
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
      statusMap:
        this.object.status.value === 'open'
          ? STATUS_MAP['pending']
          : STATUS_MAP[this.object.state.value],
      imageUrl: getAssetUrl('img/avatar.png'),
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
            let _slot
            if (!this.$hasPerm('terminal.view_session')) {
              return createVNodeCompat('span', null, [this.$t('Session')])
            }
            return createVNodeCompat(
              resolveComponentCompat('el-link'),
              {
                onClick: () => this.handleSideEffect(value)
              },
              _isSlot((_slot = this.$t('Session')))
                ? _slot
                : {
                    default: () => [_slot]
                  }
            )
          }
        },
        {
          key: this.$t('ApplyFromCMDFilterRule'),
          value: {
            cmdFilterRuleId: object.apply_from_cmd_filter_rule,
            cmdFilterId: object.apply_from_cmd_filter
          },
          formatter: function (item, value) {
            let _slot2
            const to = {
              name: 'CommandFilterRulesUpdate',
              params: {
                id: value.cmdFilterRuleId
              },
              query: {
                filter: value.cmdFilterId,
                oid: object.org_id
              }
            }
            if (!this.$hasPerm('assets.change_commandfilterrule')) {
              return createVNodeCompat('span', null, [this.$t('CommandFilterRules')])
            }
            return createVNodeCompat(
              resolveComponentCompat('router-link'),
              {
                to: to
              },
              _isSlot((_slot2 = this.$t('CommandFilterRules')))
                ? _slot2
                : {
                    default: () => [_slot2]
                  }
            )
          }
        }
      ]
    }
  },
  methods: {
    handleSideEffect(value) {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail',
        row: {},
        col: {},
        id: value.id
      })
      this.$nextTick(() => {
        this.drawerVisible = true
      })
    }
  }
}
</script>
