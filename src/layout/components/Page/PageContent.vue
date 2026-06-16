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
    padding: 12px 30px 22px;
    box-sizing: border-box;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .wrapper-content :deep(.el-alert) {
    margin: 0;
  }

  .page-alert :deep(.el-alert) {
    margin: 0;
  }
</style>
