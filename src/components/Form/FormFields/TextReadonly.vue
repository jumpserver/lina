<template>
  <div :class="bolder ? 'bolder' : ''" class="input-text">
    {{ value.toString() || text }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Boolean],
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    bolder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang='scss' scoped>
.input-text {
  line-height: 32px;
  padding-left: 8px;
  height: 32px;
  margin-top: 4px;
  font-size: 13px;
}
.bolder {
  border: solid 1px #dcdfe6;
}

</style>
