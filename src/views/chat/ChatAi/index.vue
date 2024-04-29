<template>
  <div class="chat-container">
    <ChatAi ref="chat" :drawer-panel-visible="true" />
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
