<template>
  <el-switch v-bind="$attrs" v-model="iValue" :class="type" inactive-color="#dcdfe6" />
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
      type: [Boolean, String],
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    iValue: {
      set: function (newValue) {
        this.$emit('input', newValue)
      },
      get: function () {
        return !!this.value
      }
    }
  },
  watch: {
    value(val) {
      this.$log.debug('Switcher Value changed: ', val)
    }
  }
}
</script>
