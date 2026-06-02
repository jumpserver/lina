<template>
  <div>
    <el-checkbox v-model="iValue">
      {{ $t('ReadAgreeTo') }}
    </el-checkbox>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iValue: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('update:value', v)
        this.$emit('input', v)
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
