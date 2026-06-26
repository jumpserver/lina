<template>
  <BaseTicketList v-bind="$data" :url="url" />
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
        hasImport: false
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
