<template>
  <div class="chat-container">
    <ChatAI ref="chat" :default-show-panel="!!from" :drawer-panel-visible="true" />
  </div>
</template>

<script>
import ChatAI from '@/components/Apps/ChatAi'

export default {
  components: {
    ChatAI
  },
  data() {
    return {
      from: this.$route.query.from
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
