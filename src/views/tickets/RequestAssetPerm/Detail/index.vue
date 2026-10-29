<template>
  <GenericDetailPage
    v-bind="config"
    class="ticket-detail-page"
    v-model:active-menu="config.activeMenu"
    v-model:object="ticket"
    :title="ticket.title || $t('TicketDetail')"
  >
    <template #headingRightSide>
      <el-button v-if="canReapply" type="primary" @click="reapply">
        {{ $t('TicketReapply') }}
      </el-button>
    </template>
    <component :is="config.activeMenu" :object="ticket" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TicketDetail from './TicketDetail'
import TicketActivity from '../../components/TicketActivity'

export default {
  components: {
    GenericDetailPage,
    TicketDetail,
    TicketActivity,
    TabPage
  },
  data() {
    return {
      ticket: {
        title: '',
        user_display: '',
        type_display: '',
        status: '',
        processor: '',
        date_created: ''
      },
      config: {
        activeMenu: 'TicketDetail',
        url: '',
        submenu: [
          {
            title: this.$t('TicketDetail'),
            name: 'TicketDetail'
          },
          {
            title: this.$t('Activity'),
            name: 'TicketActivity'
          }
        ],
        actions: {
          detailApiUrl: `/api/v1/tickets/tickets/${this.$context.get('id')}/`
        },
        getObjectName: this.getObjectName,
        hasActivity: false,
        hasRightSide: false
      }
    }
  },
  computed: {
    canReapply() {
      return Boolean(
        this.ticket.id &&
        this.ticket.org_id &&
        this.ticket.state?.value === 'rejected' &&
        this.ticket.reapply_action === 'reapply'
      )
    }
  },
  methods: {
    reapply() {
      if (!this.canReapply) return
      this.$router.push({
        name: 'RequestAssetPermTicketCreateUpdate',
        query: { source_ticket: this.ticket.id, oid: this.ticket.org_id }
      })
    },
    getObjectName() {
      return this.ticket.title
    }
  }
}
</script>

<style scoped src="@/views/tickets/ticket-detail.css"></style>
