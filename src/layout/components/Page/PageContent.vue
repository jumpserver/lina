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
    padding: 12px 24px 22px;
    max-width: 1200px;
  }

  .wrapper-content >>> .el-alert {
    margin-bottom: 15px;
  }

  .page-alert >>> .el-alert {
    margin-bottom: 20px;
  }
</style>
