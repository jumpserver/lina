<template>
  <BaseTicketList v-bind="$data" :url="url" show-approvers />
</template>

<script>
import BaseTicketList from '@/views/tickets/BaseTicketList'

export default {
  name: 'AuditTicketList',
  components: {
    BaseTicketList
  },
  data() {
    return {
      extraTicketAction: {
        hasImport: false,
        hasLeftActions: false
      }
    }
  },
  computed: {
    url() {
      return `/api/v1/audits/tickets/`
    }
  }
}
</script>
