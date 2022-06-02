<template>
  <BaseTicketList :url="url" />
</template>

<script>
import BaseTicketList from './BaseTicketList'
import { mapGetters } from 'vuex'
export default {
  name: 'AssignedTicketList',
  components: {
    BaseTicketList
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
