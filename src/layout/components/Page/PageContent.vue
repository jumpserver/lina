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
  }

  .wrapper-content :deep(.el-alert) {
    margin-bottom: 15px;
  }

  .page-alert :deep(.el-alert) {
    margin-bottom: 20px;
  }
</style>
