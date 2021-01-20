<template>
  <TicketListTable :url="url" :has-more-actions="true" />
</template>

<script>
import TicketListTable from './TicketListTable'
import { mapGetters } from 'vuex'
export default {
  name: 'MyTicketList',
  components: {
    TicketListTable
  },
  data() {
    return {

    }
  },
  computed: {
    url() {
      return `/api/v1/tickets/tickets/?applicant=${this.currentUser.id}`
    },
    ...mapGetters([
      'currentUser'
    ])
  }
}
</script>

<style scoped>

</style>
