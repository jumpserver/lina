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
    padding: 24px 24px 22px;
  }

  .wrapper-content >>> .el-alert {
    margin-bottom: 15px;
  }

  .page-alert >>> .el-alert {
    margin-bottom: 20px;
  }
</style>
