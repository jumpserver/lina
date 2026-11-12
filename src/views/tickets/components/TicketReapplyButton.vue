<template>
  <el-button v-if="ticket.reapply_action === 'reapply'" type="primary" @click="reapply">
    {{ $t('TicketReapply') }}
  </el-button>
</template>

<script>
export default {
  props: { ticket: { type: Object, required: true } },
  methods: {
    reapply() {
      if (this.ticket.reapply_action !== 'reapply') return
      const type = this.ticket.type?.value || this.ticket.type
      this.$router.push({
        name: type === 'apply_asset' ? 'RequestAssetPermTicketCreateUpdate' : 'PluginTicketCreate',
        query: { type, source_ticket: this.ticket.id, oid: this.ticket.org_id }
      })
    }
  }
}
</script>
