<template>
  <div>
    <el-badge :hidden="assignedTicketCount===0" :value="assignedTicketCount" size="mini" type="primary">
      <el-link class="el-link" target="_blank" @click="goToTickets">
        <svg-icon icon-class="ticket" style="font-size: 16px;" />
      </el-link>
    </el-badge>
  </div>
</template>

<script>
import { getTicketOpenCount } from '@/api/ticket'
import { mapGetters } from 'vuex'

export default {
  name: 'WebTerminal',
  data() {
    return {
      assignedTicketCount: 0
    }
  },
  computed: {
    ...mapGetters([
      'currentUser'
    ])
  },
  created() {
    this.ticketsOpenedCount()
  },
  methods: {
    ticketsOpenedCount() {
      getTicketOpenCount(this.currentUser.id).then(data => {
        this.assignedTicketCount = data.count
      })
    },
    goToTickets() {
      // this.$router.push({ name: 'TicketList' })
      this.$router.push('/tickets/assigned-tickets')
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

.el-badge ::v-deep .el-badge__content.is-fixed {
  top: 10px;
}

.icon {
  color: #fff
}
</style>
