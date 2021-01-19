<template>
  <TicketListTable :url="url" />
</template>

<script>
import TicketListTable from './TicketListTable'
import { mapGetters } from 'vuex'
export default {
  name: 'AssignedTicketList',
  components: {
    TicketListTable
  },
  computed: {
    url() {
      return `/api/v1/tickets/tickets/?assignees__id=${this.currentUser.id}`
    },
    ...mapGetters([
      'currentUser'
    ])
  }
}
</script>

<style scoped>

</style>
