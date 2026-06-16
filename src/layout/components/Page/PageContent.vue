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
    gap: 8px;
  }

  .wrapper-content :deep(.page-alert) {
    margin: 0;
  }

  .wrapper-content :deep(.page-alert .el-alert__icon),
  .wrapper-content :deep(.page-alert .el-alert__icon .el-icon),
  .wrapper-content :deep(.page-alert .el-alert__icon .el-icon svg) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  .wrapper-content :deep(.page-alert .el-alert__title),
  .wrapper-content :deep(.page-alert .el-alert__description),
  .wrapper-content :deep(.page-alert .el-alert__content),
  .wrapper-content :deep(.page-alert .el-alert__description p),
  .wrapper-content :deep(.page-alert .el-alert__content p),
  .wrapper-content :deep(.page-alert .el-alert__content span),
  .wrapper-content :deep(.page-alert .announcement-main) {
    font-size: 12px !important;
    line-height: 1.5;
  }

  .wrapper-content :deep(.page-alert .el-alert__closebtn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
</style>
