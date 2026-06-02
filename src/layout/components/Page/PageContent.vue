<template>
  <div class="wrapper-content">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageContent'
}
</script>

<style scoped>
.wrapper-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  min-height: 0;
  padding: var(--space-4) var(--space-6);
}

.wrapper-content :deep(> *) {
  min-width: 0;
}

.wrapper-content :deep(.el-alert) {
  margin-bottom: 0;
}

.page-alert :deep(.el-alert) {
  margin-bottom: 0;
}
</style>
