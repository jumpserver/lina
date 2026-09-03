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
  padding: var(--page-content-top-padding, 12px) var(--page-inline-padding, 20px)
    var(--page-content-bottom-padding, 22px);
  box-sizing: border-box;
  min-height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap, 8px);
  background-color: var(--page-content-background-color, #f3f3f4);
}

/*
 * 内容组件常用单个 <div>（无 class 或 class=""）包裹多个区块，该 wrapper 会成为 .wrapper-content
 * 唯一的 flex 子节点，使外层 gap 对其内部区块失效。Page 的 slot 无 transition 包裹，故对这类纯
 * 结构 wrapper 用 display: contents 让其在布局上透明，子元素直接成为 .wrapper-content 的 flex
 * 子项、与 .page-alert 同级并直接吃到外层 gap。带 class 的 wrapper 有自身样式，保持不变。
 */
.wrapper-content > :deep(div:not([class])),
.wrapper-content > :deep(div[class='']) {
  display: contents;
}

/*
 * 普通内容卡片不出现内部滚动条，由 .wrapper-content 整体滚动。列表页会由
 * list-layout.scss 单独覆盖为表格内部滚动。
 */
.wrapper-content :deep(.el-card__body),
.wrapper-content :deep(.ibox),
.wrapper-content :deep(.el-card) {
  overflow: visible !important;
  max-height: none !important;
}

.wrapper-content :deep(.page-alert) {
  margin: 0;
}

/*
 * 统一页面级 el-alert（含 settings 页手写的 el-alert）的字号/图标尺寸，使其与 console 中
 * 通过 help-tip 渲染的 .page-alert 一致。表单内的提示（.el-form 内 / .help-block）有自身
 * 样式，排除在外。
 */
.wrapper-content :deep(.el-alert:not(.help-warning)) {
  margin: 0;
}

/*
 * 列表顶部提示统一使用板块圆角。覆盖 Page / TabPage 自带提示，以及列表组件外层
 * 直接声明的提示；不把样式扩散到表单字段、弹窗等内部 Alert。
 */
.wrapper-content > :deep(.el-alert:not(.help-warning)),
.wrapper-content :deep(.tab-page-content > .el-alert:not(.help-warning)),
.wrapper-content
  :deep(.tab-page-content > div:not([class]) > .el-alert:first-child:not(.help-warning)),
.wrapper-content :deep([data-list-layout='container'] > .el-alert:not(.help-warning)) {
  border-radius: var(--page-alert-border-radius, 4px);
}

.wrapper-content :deep(.page-alert .el-alert__icon),
.wrapper-content :deep(.page-alert .el-alert__icon .el-icon),
.wrapper-content :deep(.page-alert .el-alert__icon .el-icon svg),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__icon),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__icon .el-icon),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__icon .el-icon svg) {
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
.wrapper-content :deep(.page-alert .announcement-main),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__title),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__description),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__content),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__content p),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__content span) {
  font-size: 12px !important;
  line-height: 1.5;
}

.wrapper-content :deep(.page-alert .el-alert__closebtn),
.wrapper-content :deep(.el-alert:not(.help-warning) .el-alert__closebtn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 16px;
}
</style>
