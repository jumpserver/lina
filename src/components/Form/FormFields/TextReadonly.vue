<template>
  <div class="input-text">
    {{ value.toString() }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Boolean],
      default: () => false
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang='scss' scoped>
.input-text {
  border: solid 1px #dcdfe6;
  line-height: 32px;
  padding-left: 5px;
  height: 32px;
  margin-top: 4px;
  font-size: 13px;
}

</style>
