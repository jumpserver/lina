<template>
  <el-row :gutter="gutter">
    <template v-if="$slots.right">
      <!-- 默认插槽内容 -->
      <el-col :md="left" :sm="24">
        <slot />
      </el-col>
      <!-- 右侧插槽 -->
      <el-col :md="right" :sm="24">
        <slot name="right" />
      </el-col>
    </template>
    <template v-else>
      <!-- 默认插槽内容，全宽 -->
      <el-col :md="single" :sm="24">
        <slot />
      </el-col>
    </template>
  </el-row>
</template>

<script>

export default {
  name: 'TwoCol',
  components: {},
  props: {
    gutter: {
      type: Number,
      default: 10
    },
    left: {
      type: Number,
      default: 14
    },
    right: {
      type: Number,
      default: 10
    },
    single: {
      type: Number,
      default: 22
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
