<template>
  <BaseTicketList :url="url" :has-more-actions="true" />
</template>

<script>
import BaseTicketList from './BaseTicketList'
import { mapGetters } from 'vuex'
export default {
  name: 'MyTicketList',
  components: {
    BaseTicketList
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
