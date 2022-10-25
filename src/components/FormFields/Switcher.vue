<template>
  <el-switch
    v-model="iValue"
    inactive-color="#dcdfe6"
    :class="type"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'Switcher', // 不能叫 Switch，否则会和 js 关键字冲突
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    value: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    }
  },
  computed: {
    iValue: {
      set: function(newValue) {
        this.$emit('input', newValue)
      },
      get: function() {
        return this.value
      }
    }
  }
}
</script>

<style scoped>

</style>
