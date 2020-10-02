<template>
  <div>
    <el-link class="el-link" target="_blank" @click="goToTickets">{{ $t('route.Ticket') }}</el-link>
    <el-badge v-if="getBadgeValue() !== 0" :value="getBadgeValue()" size="mini" type="primary" />
  </div>
</template>

<script>
import { getTicketOpenCount } from '@/api/ticket'

export default {
  name: 'WebTerminal',
  data: function() {
    return {
      assignedTicketCount: 0
    }
  },
  created() {
    this.getTicketsOpenCount()
  },
  methods: {
    getBadgeValue() {
      return this.assignedTicketCount
    },
    getTicketsOpenCount() {
      getTicketOpenCount(1).then(data => {
        this.assignedTicketCount = data.count
      })
    },
    goToTickets() {
      this.$router.push({ name: 'TicketList' })
    }
  }
}
</script>

<style scoped>
.el-link {
  color: #606266 !important;
  font-size: 13px;
  font-weight: 400
}
</style>
