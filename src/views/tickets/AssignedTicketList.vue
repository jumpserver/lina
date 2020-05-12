<template>
  <TicketListTable :url="url" />
</template>

<script>
import TicketListTable from './TicketListTable'
export default {
  name: 'AssignedTicketList',
  components: {
    TicketListTable
  },
  data() {
    return {
      url: 'api/v1/tickets/tickets/?assign=1'
    }
  }
}
</script>

<style scoped>

</style>
