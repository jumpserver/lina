<template>
  <div class="chat-ai-page">
    <ChatAI :drawer-panel-visible="true" />
  </div>
</template>

<script setup>
import ChatAI from '@/components/Apps/ChatAi'
</script>

<style scoped>
.chat-ai-page {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 94px);
  overflow: hidden;
  background: var(--page-background-color, #fff);
}
</style>
