<template>
  <GenericTicketDetail
    :object="object"
    :special-card-items="specialCardItems"
    :show-comment="connections.length <= 1"
  >
    <IBox v-if="connections.length > 1" title="ApplyInfo" class="connection-info">
      <p class="connection-user">
        {{ $t('ApplyLoginUser') }}:
        {{
          object.request_items?.find((item) => item.name === 'apply_login_user')?.value ||
          object.rel_snapshot?.apply_login_user ||
          '-'
        }}
      </p>
      <LoginAssetConnections :connections="connections" />
    </IBox>
  </GenericTicketDetail>
</template>

<script>
import { STATUS_MAP } from '../../const'
import GenericTicketDetail from '@/views/tickets/components/GenericTicketDetail'
import LoginAssetConnections from '@/views/tickets/components/LoginAssetConnections.vue'
import IBox from '@/components/Common/IBox'
import { getAssetUrl } from '@/utils/assets'

export default {
  name: 'AssetTicketDetail',
  components: {
    GenericTicketDetail,
    LoginAssetConnections,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
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
    connections() {
      return this.object.login_asset_connections || []
    },
    specialCardItems() {
      if (this.connections.length > 1) return []
      return (this.object.request_items || []).map((item) => ({
        key: item.label,
        value: item.value
      }))
    }
  },
  methods: {}
}
</script>

<style scoped>
.connection-info {
  margin-bottom: 15px;
}

.connection-user {
  margin: 0 0 12px;
  font-size: 13px;
}
</style>
