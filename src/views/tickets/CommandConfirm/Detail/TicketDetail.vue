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

<script lang="jsx">
import { STATUS_MAP } from '../../const'
import Drawer from '@/components/Drawer/index.vue'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import { getAssetUrl } from '@/utils/assets'
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
      return (object.request_items || []).map((item) => ({
        key: item.label,
        value: item.value,
        ...(item.name === 'apply_from_session'
          ? {
              formatter: (_item, value) => {
                if (!this.$hasPerm('terminal.view_session')) {
                  return <span>{this.$t('Session')}</span>
                }
                return (
                  <el-link onClick={() => this.handleSideEffect(value)}>
                    {this.$t('Session')}
                  </el-link>
                )
              }
            }
          : {})
      }))
    }
  },
  methods: {
    handleSideEffect(value) {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail',
        row: {},
        col: {},
        id: value?.id || value
      })
      this.$nextTick(() => {
        this.drawerVisible = true
      })
    }
  }
}
</script>
