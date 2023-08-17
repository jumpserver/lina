<template>
  <div class="form-group-header">
    <div v-if="line" class="hr-line-dashed" />
    <h3>{{ group['title'] }} </h3>
  </div>
</template>

<script>
export default {
  props: {
    line: {
      type: Boolean,
      default: true
    },
    index: {
      type: Number,
      default: 1
    },
    group: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="less" scoped>
.hr-line-dashed {
    border-top: 1px dashed #e7eaec;
    color: #ffffff;
    background-color: #ffffff;
    height: 1px;
    margin: 20px 0;
}
</style>
