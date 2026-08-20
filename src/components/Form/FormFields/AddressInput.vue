<template>
  <div class="address-input-wrapper">
    <el-input
      :value="value"
      @input="onInput"
    />
  </div>
</template>

<script>
export default {
  name: 'AddressInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    kinds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', val)
    }
  }
}
</script>

<style scoped>
.address-input-wrapper {
  width: 100%;
}
</style>
