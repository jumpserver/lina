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
    padding: 20px 25px 40px;
  }

  .wrapper-content >>> .el-alert {
    margin-bottom: 15px;
  }

  .page-alert >>> .el-alert {
    margin-bottom: 20px;
  }
</style>
