<template>
  <el-switch
    v-model="iValue"
    :active-color="activeColor"
    inactive-color="#dcdfe6"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
export default {
  name: 'Switcher',
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
    activeColor() {
      // $--color-primary: #1ab394;
      // $--color-success: #1c84c6;
      // $--color-info: #23c6c8;
      // $--color-warning: #f8ac59;
      // $--color-danger: #ed5565;
      switch (this.type) {
        case 'primary':
          return '#1ab394'
        case 'danger':
          return '#ed5565'
        default:
          return '#1ab394'
      }
    },
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
