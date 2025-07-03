<template>
  <BaseTicketList :url="url" v-bind="$data" />
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
      extraActions: {}
    }
  },
  computed: {
    url() {
      return `/api/v1/tickets/tickets/`
    }
  }
}
</script>
