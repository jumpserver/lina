<template>
  <div>
    <el-badge
      :hidden="assignedTicketCount === 0"
      :value="assignedTicketCount"
      size="small"
      type="primary"
    >
      <el-link class="el-link" target="_blank" @click="goToTickets">
        <svg-icon icon-class="ticket" />
      </el-link>
    </el-badge>
  </div>
</template>

<script>
import { getTicketOpenCount } from '@/api/ticket'
import { mapGetters } from 'vuex'
import { eventBus } from '@/utils/vue/eventbus'

export default {
  name: 'WebTerminal',
  data() {
    return {
      assignedTicketCount: 0,
      requestId: 0,
      refreshTimer: null,
      disposed: false
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  watch: {
    'currentUser.id'() {
      this.assignedTicketCount = 0
      this.ticketsOpenedCount()
    }
  },
  created() {
    eventBus.on('ticket-count-refresh', this.ticketsOpenedCount)
    eventBus.on('drawer-resource-change', this.onResourceChanged)
    window.addEventListener('focus', this.ticketsOpenedCount)
    this.ticketsOpenedCount()
  },
  beforeUnmount() {
    this.disposed = true
    this.requestId++
    clearTimeout(this.refreshTimer)
    eventBus.off('ticket-count-refresh', this.ticketsOpenedCount)
    eventBus.off('drawer-resource-change', this.onResourceChanged)
    window.removeEventListener('focus', this.ticketsOpenedCount)
  },
  methods: {
    async ticketsOpenedCount() {
      clearTimeout(this.refreshTimer)
      const requestId = ++this.requestId
      const userId = this.currentUser?.id
      if (this.disposed || !userId) return
      try {
        const data = await getTicketOpenCount(userId)
        if (requestId === this.requestId && userId === this.currentUser?.id && !this.disposed) {
          this.assignedTicketCount = data.count
        }
      } catch {
        // Keep the last known count and retry on the next refresh.
      } finally {
        if (requestId === this.requestId && !this.disposed) {
          this.refreshTimer = setTimeout(this.ticketsOpenedCount, 30000)
        }
      }
    },
    onResourceChanged({ path } = {}) {
      if (path?.startsWith('/tickets/')) this.ticketsOpenedCount()
    },
    goToTickets() {
      this.ticketsOpenedCount()
      this.$router.push('/tickets/assigned-tickets')
    }
  }
}
</script>

<style scoped>
.el-link {
  color: #606266 !important;
  font-size: 13px;
  font-weight: 400;
}

.el-badge :deep(.el-badge__content.is-fixed) {
  top: 10px;
}

.icon {
  color: #fff;
}
</style>
