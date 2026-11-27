<template>
  <el-tooltip :trigger="['hover', 'focus']" placement="top" :show-after="200">
    <template #content>
      <div class="reason-full">{{ value }}</div>
    </template>
    <span class="reason-preview" tabindex="0">{{ value }}</span>
  </el-tooltip>
</template>

<script setup>
defineProps({ value: { type: String, required: true } })
</script>

<style scoped>
.reason-preview,
.reason-full {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.reason-preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.reason-full {
  max-width: min(36rem, 75vw);
  max-height: 40vh;
  overflow-y: auto;
}
</style>
