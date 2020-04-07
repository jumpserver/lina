<template>
  <div class="form-group-header">
    <div v-if="line" class="hr-line-dashed" />
    <h3>{{ title }}</h3>
  </div>

</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Title'
    },
    line: {
      type: Boolean,
      default: true
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
