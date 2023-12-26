<template>
  <div class="chat-container">
    <ChatAi ref="chat" :drawer-panel-visible="true" :has-close="false" />
  </div>
</template>

<script>
import ChatAi from '@/components/Apps/ChatAi'
export default {
  components: {
    ChatAi
  },
  data() {
    return {
    }
  },
  mounted() {
    this.$refs.chat.initWebSocket()
  },
  methods: {
  }
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
}
</style>
