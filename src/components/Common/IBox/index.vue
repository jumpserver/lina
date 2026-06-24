<template>
  <el-card v-bind="$attrs" :class="'ibox ' + type" :shadow="shadow">
    <template v-if="title" #header>
      <slot name="header">
        <div v-if="title" class="clearfix ibox-title">
          <i v-if="fa" :class="'fa ' + fa" />
          <h5>{{ title }}</h5>
        </div>
      </slot>
    </template>
    <slot />
  </el-card>
</template>

<script>
export default {
  name: 'IBox',
  props: {
    title: {
      type: String,
      default: () => null
    },
    fa: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'default'
    },
    shadow: {
      type: String,
      default: 'never'
    }
  },
  computed: {
    iClass() {
      return this.type
    }
  }
}
</script>

<style lang="scss" scoped>
/*
 * 统一约定：
 * - card 直接外层（.ibox / .el-card）不设任何 padding，padding 全部落在 __body / __header。
 * - __body 内部统一 flex 列布局，左右 padding 20px。
 * - __header 同样左右 20px。
 * 特殊场景（表格类贴边、详情页 quick-update、撑满高度）由各自组件穿透覆盖。
 */
.ibox {
  clear: both;
  padding: 0;
}

.ibox :deep(.el-card__header) {
  border-color: #e7eaec;
  border-image: none;
  margin-bottom: 0;
  padding: 10px 20px;
  min-height: 30px;
  line-height: 1.32;
  font-weight: normal;
}

.ibox-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ibox-title h5 {
  display: inline-block;
  font-size: 13px;
  margin: 0;
  padding: 0;
  text-overflow: ellipsis;
  font-weight: 500;
}

.ibox-tools a {
  cursor: pointer;
  margin-left: 5px;
  color: #c4c4c4;
}

.ibox-tools {
  display: block;
  float: none;
  margin-top: 0;
  position: relative;
  padding: 0;
  text-align: right;
}

.fa {
  font-size: 14px;
}

.ibox :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: var(--color-icon-primary);
}
</style>
